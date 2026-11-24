import "dotenv/config";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestHarness } from "../helpers/testApp.js";

describe("Phase 5: Calendar, Finance, Dashboard & Testimonials API", () => {
  const { prisma, app, loginAsAdmin } = createTestHarness();
  const testCarId = "test-car-phase5";
  const bookingCodes = [
    "BK-P5-PAID-001",
    "BK-P5-DP-002",
    "BK-P5-PEND-003",
  ];

  beforeAll(async () => {
    await prisma.testimonial.deleteMany({
      where: {
        OR: [
          { bookingCode: { in: bookingCodes } },
          { customerName: { startsWith: "Phase5 " } },
        ],
      },
    });
    await prisma.booking.deleteMany({
      where: { bookingCode: { in: bookingCodes } },
    });
    await prisma.car.deleteMany({ where: { id: testCarId } });

    await prisma.car.create({
      data: {
        id: testCarId,
        slug: "test-car-phase5",
        name: "Test Innova Phase 5",
        brand: "Toyota",
        capacityLabel: "7 Kursi",
        pricePerDay: 300000,
        imageUrl: "/Toyota Innova Reborn.png",
        status: "AVAILABLE",
      },
    });

    // 1. COMPLETED + PAID booking (eligible for testimonial & finance)
    await prisma.booking.create({
      data: {
        bookingCode: "BK-P5-PAID-001",
        carId: testCarId,
        carNameSnapshot: "Test Innova Phase 5",
        customerName: "Phase5 Siti",
        customerPhone: "6281234567801",
        startDate: new Date("2099-11-10"),
        endDate: new Date("2099-11-12"),
        totalDays: 3,
        serviceType: "WITH_DRIVER",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        paymentScheme: "FULL",
        paymentStatus: "PAID",
        paidAmount: 900000,
        status: "COMPLETED",
      },
    });

    // 2. CONFIRMED + DP_PAID booking (appears in finance & calendar)
    await prisma.booking.create({
      data: {
        bookingCode: "BK-P5-DP-002",
        carId: testCarId,
        carNameSnapshot: "Test Innova Phase 5",
        customerName: "Phase5 Andi",
        customerPhone: "6281234567802",
        startDate: new Date("2099-11-20"),
        endDate: new Date("2099-11-22"),
        totalDays: 3,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        paymentScheme: "DP_50",
        paymentStatus: "DP_PAID",
        paidAmount: 450000,
        status: "CONFIRMED",
      },
    });

    // 3. PENDING + UNPAID booking (not in finance, not eligible for testimonial)
    await prisma.booking.create({
      data: {
        bookingCode: "BK-P5-PEND-003",
        carId: testCarId,
        carNameSnapshot: "Test Innova Phase 5",
        customerName: "Phase5 Rudi",
        customerPhone: "6281234567803",
        startDate: new Date("2099-12-01"),
        endDate: new Date("2099-12-02"),
        totalDays: 2,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 600000,
        finalPrice: 600000,
        paymentScheme: "FULL",
        paymentStatus: "UNPAID",
        paidAmount: 0,
        status: "PENDING",
      },
    });
  });

  afterAll(async () => {
    await prisma.testimonial.deleteMany({
      where: {
        OR: [
          { bookingCode: { in: bookingCodes } },
          { customerName: { startsWith: "Phase5 " } },
        ],
      },
    });
    await prisma.booking.deleteMany({
      where: { bookingCode: { in: bookingCodes } },
    });
    await prisma.car.deleteMany({ where: { id: testCarId } });
    await prisma.$disconnect();
  });

  it("GET /api/v1/admin/dashboard/summary returns car & booking stats and lists", async () => {
    const cookies = await loginAsAdmin();

    const res = await request(app)
      .get("/api/v1/admin/dashboard/summary")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.carStats.total).toBeGreaterThanOrEqual(5);
    expect(res.body.data.bookingStats.total).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(res.body.data.recentBookings)).toBe(true);
    expect(Array.isArray(res.body.data.upcomingSchedules)).toBe(true);
  });

  it("GET /api/v1/admin/calendar returns month-filtered bookings", async () => {
    const cookies = await loginAsAdmin();

    const res = await request(app)
      .get("/api/v1/admin/calendar?month=2099-11&carId=" + testCarId)
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    const codes = (res.body.data.bookings as Array<{ bookingCode: string }>).map(
      (b) => b.bookingCode
    );
    expect(codes).toContain("BK-P5-PAID-001");
    expect(codes).toContain("BK-P5-DP-002");
    expect(codes).not.toContain("BK-P5-PEND-003");
  });

  it("GET /api/v1/admin/finance/summary aggregates DP_PAID and PAID bookings", async () => {
    const cookies = await loginAsAdmin();

    const res = await request(app)
      .get("/api/v1/admin/finance/summary?month=2099-11")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalPaid: 1350000,
      totalRemaining: 450000,
      totalFinalPrice: 1800000,
      dpCount: 1,
      paidCount: 1,
    });
    expect(res.body.data.availableMonths).toContain("2099-11");
  });

  it("handles public testimonial eligibility, single submit for COMPLETED, and admin moderation", async () => {
    // 1. Ineligible when PENDING
    const badElig = await request(app).get(
      "/api/v1/testimonials/eligibility?kode=BK-P5-PEND-003"
    );
    expect(badElig.status).toBe(200);
    expect(badElig.body.data.eligible).toBe(false);

    // 2. Eligible when COMPLETED
    const okElig = await request(app).get(
      "/api/v1/testimonials/eligibility?kode=BK-P5-PAID-001"
    );
    expect(okElig.status).toBe(200);
    expect(okElig.body.data.eligible).toBe(true);
    expect(okElig.body.data.booking.carName).toBe("Test Innova Phase 5");

    // 3. Submit public testimonial -> PENDING (not visible publicly yet)
    const submitRes = await request(app).post("/api/v1/testimonials").send({
      bookingCode: "BK-P5-PAID-001",
      customerName: "Phase5 Siti",
      rating: 5,
      tripLabel: "Dengan Sopir",
      quote: "Mobil sangat bersih, nyaman, dan pelayanan tepat waktu di Kupang.",
    });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data.status).toBe("PENDING");
    const testimonialId = submitRes.body.data.id as string;

    // 4. Duplicate submit for same bookingCode rejected with 409
    const dupRes = await request(app).post("/api/v1/testimonials").send({
      bookingCode: "BK-P5-PAID-001",
      rating: 5,
      tripLabel: "Dengan Sopir",
      quote: "Coba kirim ulang testimoni untuk kode booking yang sama.",
    });
    expect(dupRes.status).toBe(409);

    // 5. Public list hides PENDING, shows after admin publishes
    const pubBefore = await request(app).get("/api/v1/testimonials");
    expect(
      (pubBefore.body.data as Array<{ id: string }>).some(
        (t) => t.id === testimonialId
      )
    ).toBe(false);

    const cookies = await loginAsAdmin();
    const pubStatusRes = await request(app)
      .patch(`/api/v1/admin/testimonials/${testimonialId}/status`)
      .set("Cookie", cookies)
      .send({ status: "PUBLISHED" });
    expect(pubStatusRes.status).toBe(200);

    const pubAfter = await request(app).get("/api/v1/testimonials");
    expect(
      (pubAfter.body.data as Array<{ id: string }>).some(
        (t) => t.id === testimonialId
      )
    ).toBe(true);
  });
});

