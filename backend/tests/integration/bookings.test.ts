import "dotenv/config";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestHarness } from "../helpers/testApp.js";

describe("Bookings API, Payment Rules, Extend & BR-09 Concurrency", () => {
  const { prisma, app, loginAsAdmin } = createTestHarness();
  const testCarId = "test-car-booking-phase4";
  const testUnitId = "test-unit-booking-phase4-1";

  beforeAll(async () => {
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.carUnit.deleteMany({ where: { carId: testCarId } });
    await prisma.car.deleteMany({ where: { id: testCarId } });

    await prisma.car.create({
      data: {
        id: testCarId,
        slug: "test-car-booking-phase4",
        name: "Test Avanza Phase 4",
        brand: "Toyota",
        capacityLabel: "7 Kursi",
        pricePerDay: 300000,
        imageUrl: "/Toyota Avanza.jpg",
        status: "AVAILABLE",
        units: {
          create: {
            id: testUnitId,
            label: "Test Avanza #1",
            plateNumber: "DH-P4-0001",
            transmission: "MATIC",
            status: "AVAILABLE",
          },
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.carUnit.deleteMany({ where: { carId: testCarId } });
    await prisma.car.deleteMany({ where: { id: testCarId } });
    await prisma.$disconnect();
  });

  it("creates PENDING booking, normalizes phone, supports Idempotency-Key, and strips internalNote on public lookup", async () => {
    const idemKey = `idem-${Date.now()}`;
    const payload = {
      carId: testCarId,
      customerName: "Delano Kupang",
      customerPhone: "081234567890",
      startDate: "2026-12-01",
      endDate: "2026-12-03",
      serviceType: "SELF_DRIVE",
      transmissionPreference: "MATIC",
      paymentScheme: "DP_50",
      pickupLocation: "Bandara El Tari",
    };

    const res1 = await request(app)
      .post("/api/v1/bookings")
      .set("Idempotency-Key", idemKey)
      .send(payload);

    expect(res1.status).toBe(201);
    expect(res1.body.data).toMatchObject({
      carId: testCarId,
      customerName: "Delano Kupang",
      customerPhone: "6281234567890",
      totalDays: 3,
      transmissionPreference: "MATIC",
      estimatedPrice: 900000,
      finalPrice: 900000,
      paymentScheme: "DP_50",
      paymentStatus: "UNPAID",
      status: "PENDING",
    });
    expect(res1.body.data.bookingCode).toMatch(/^BK-\d{8}-A\d{3,}$/);

    // Duplicate click with same Idempotency-Key returns same booking without creating a second row
    const res2 = await request(app)
      .post("/api/v1/bookings")
      .set("Idempotency-Key", idemKey)
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.body.data.id).toBe(res1.body.data.id);

    // Public lookup strips internalNote and carUnitLabel (plateNumber admin-only)
    const pubRes = await request(app).get(
      `/api/v1/bookings/code/${res1.body.data.bookingCode}`
    );
    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.internalNote).toBeUndefined();
    expect(pubRes.body.data.carUnitId).toBeUndefined();
    expect(pubRes.body.data.carUnitLabel).toBeUndefined();
  });

  it("enforces state machine, payment-gate for COMPLETED, non-regressive payment, and extend downgrade", async () => {
    const cookies = await loginAsAdmin();

    // Admin creates walk-in booking (3 days -> DP_50 allowed)
    const createRes = await request(app)
      .post("/api/v1/admin/bookings")
      .set("Cookie", cookies)
      .send({
        carId: testCarId,
        customerName: "Budi Santoso",
        customerPhone: "081299988877",
        startDate: "2026-12-05",
        endDate: "2026-12-07",
        serviceType: "WITH_DRIVER",
        transmissionPreference: "MATIC",
        paymentScheme: "DP_50",
        internalNote: "Jemput jam 08.00",
      });
    expect(createRes.status).toBe(201);
    const id = createRes.body.data.id as string;

    // Confirm
    const confRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/status`)
      .set("Cookie", cookies)
      .send({ status: "CONFIRMED" });
    expect(confRes.status).toBe(200);

    // Pay DP_PAID (450,000)
    const dpRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/payment`)
      .set("Cookie", cookies)
      .send({ paymentScheme: "DP_50", paymentStatus: "DP_PAID" });
    expect(dpRes.status).toBe(200);
    expect(dpRes.body.data.paidAmount).toBe(450000);

    // Start trip -> IN_PROGRESS
    const progRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/status`)
      .set("Cookie", cookies)
      .send({ status: "IN_PROGRESS" });
    expect(progRes.status).toBe(200);

    // Cannot regress DP_PAID -> UNPAID during IN_PROGRESS
    const regressRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/payment`)
      .set("Cookie", cookies)
      .send({ paymentScheme: "DP_50", paymentStatus: "UNPAID" });
    expect(regressRes.status).toBe(400);

    // Payment-gate: cannot mark COMPLETED while only DP_PAID
    const blockedCompRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/status`)
      .set("Cookie", cookies)
      .send({ status: "COMPLETED" });
    expect(blockedCompRes.status).toBe(409);
    expect(blockedCompRes.body.error.code).toBe("PAYMENT_REQUIRED");

    // Pay in full -> PAID (900,000)
    const paidRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/payment`)
      .set("Cookie", cookies)
      .send({ paymentScheme: "DP_50", paymentStatus: "PAID" });
    expect(paidRes.status).toBe(200);
    expect(paidRes.body.data.paidAmount).toBe(900000);

    // Extend by 1 day (2026-12-08) -> finalPrice becomes 1,200,000, paidAmount stays 900,000, status downgrades PAID -> DP_PAID
    const extRes = await request(app)
      .post(`/api/v1/admin/bookings/${id}/extend`)
      .set("Cookie", cookies)
      .send({ newEndDate: "2026-12-08" });
    expect(extRes.status).toBe(200);
    expect(extRes.body.data).toMatchObject({
      totalDays: 4,
      finalPrice: 1200000,
      paidAmount: 900000,
      paymentStatus: "DP_PAID",
    });

    // Settle remaining balance -> PAID, then COMPLETED
    await request(app)
      .patch(`/api/v1/admin/bookings/${id}/payment`)
      .set("Cookie", cookies)
      .send({ paymentScheme: "DP_50", paymentStatus: "PAID" });

    const compRes = await request(app)
      .patch(`/api/v1/admin/bookings/${id}/status`)
      .set("Cookie", cookies)
      .send({ status: "COMPLETED" });
    expect(compRes.status).toBe(200);
    expect(compRes.body.data.status).toBe("COMPLETED");
  });

  it("prevents BR-09 double booking under parallel concurrent CONFIRMED requests", async () => {
    const cookies = await loginAsAdmin();

    const [p1, p2] = await Promise.all([
      request(app).post("/api/v1/bookings").send({
        carId: testCarId,
        customerName: "Race User 1",
        customerPhone: "081111111111",
        startDate: "2026-12-15",
        endDate: "2026-12-17",
        serviceType: "SELF_DRIVE",
        transmissionPreference: "MATIC",
      }),
      request(app).post("/api/v1/bookings").send({
        carId: testCarId,
        customerName: "Race User 2",
        customerPhone: "082222222222",
        startDate: "2026-12-16",
        endDate: "2026-12-18",
        serviceType: "SELF_DRIVE",
        transmissionPreference: "MATIC",
      }),
    ]);

    expect(p1.status).toBe(201);
    expect(p2.status).toBe(201);

    const [c1, c2] = await Promise.all([
      request(app)
        .patch(`/api/v1/admin/bookings/${p1.body.data.id}/status`)
        .set("Cookie", cookies)
        .send({ status: "CONFIRMED" }),
      request(app)
        .patch(`/api/v1/admin/bookings/${p2.body.data.id}/status`)
        .set("Cookie", cookies)
        .send({ status: "CONFIRMED" }),
    ]);

    const statuses = [c1.status, c2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([200, 409]);

    const failed = c1.status === 409 ? c1 : c2;
    expect(failed.body.error.code).toBe("SCHEDULE_CONFLICT");
  });
});

