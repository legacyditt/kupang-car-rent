import "dotenv/config";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestHarness } from "../helpers/testApp.js";

describe("Cars & Availability API", () => {
  const { prisma, app, loginAsAdmin } = createTestHarness();
  const createdCarIds: string[] = [];

  beforeAll(async () => {
    await prisma.booking.deleteMany({
      where: { bookingCode: { startsWith: "BK-CAR-TEST-" } },
    });
    await prisma.car.deleteMany({
      where: { slug: { startsWith: "test-unit-" } },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({
      where: { bookingCode: { startsWith: "BK-CAR-TEST-" } },
    });
    if (createdCarIds.length > 0) {
      await prisma.car.deleteMany({ where: { id: { in: createdCarIds } } });
    }
    await prisma.car.deleteMany({
      where: { slug: { startsWith: "test-unit-" } },
    });
    await prisma.$disconnect();
  });

  it("GET /api/v1/cars returns active cars excluding INACTIVE and includes derived bookedDates", async () => {
    const cookies = await loginAsAdmin();

    const inactiveRes = await request(app)
      .post("/api/v1/admin/cars")
      .set("Cookie", cookies)
      .send({
        name: "Test Unit Inactive",
        transmission: "MANUAL",
        capacityLabel: "7 Kursi",
        pricePerDay: 350000,
        imageUrl: "/Toyota Avanza.jpg",
        status: "INACTIVE",
      });
    expect(inactiveRes.status).toBe(201);
    createdCarIds.push(inactiveRes.body.data.id);

    const activeRes = await request(app)
      .post("/api/v1/admin/cars")
      .set("Cookie", cookies)
      .send({
        name: "Test Unit Active",
        brand: "Daihatsu",
        capacityLabel: "7 Kursi",
        pricePerDay: 320000,
        imageUrl: "/Toyota Avanza.jpg",
        status: "AVAILABLE",
      });
    expect(activeRes.status).toBe(201);
    const activeCarId = activeRes.body.data.id as string;
    const activeSlug = activeRes.body.data.slug as string;
    createdCarIds.push(activeCarId);

    // Add 1 CONFIRMED booking on 2026-12-20..2026-12-21
    await prisma.booking.create({
      data: {
        bookingCode: "BK-CAR-TEST-001",
        carId: activeCarId,
        carNameSnapshot: "Test Unit Active",
        customerName: "Tester",
        customerPhone: "6281234567890",
        startDate: new Date("2026-12-20"),
        endDate: new Date("2026-12-21"),
        totalDays: 2,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 320000,
        estimatedPrice: 640000,
        finalPrice: 640000,
        status: "CONFIRMED",
      },
    });

    const publicRes = await request(app).get("/api/v1/cars");
    expect(publicRes.status).toBe(200);

    const slugs = (publicRes.body.data as Array<{ slug: string }>).map(
      (c) => c.slug
    );
    expect(slugs).toContain(activeSlug);
    expect(slugs).not.toContain(inactiveRes.body.data.slug);

    const activeCar = (
      publicRes.body.data as Array<{ slug: string; bookedDates: string[] }>
    ).find((c) => c.slug === activeSlug);
    expect(activeCar?.bookedDates).toEqual(["20-12-2026", "21-12-2026"]);

    // Availability check: overlapping -> false, non-overlapping -> true
    const conflictAvail = await request(app).get(
      `/api/v1/cars/${activeSlug}/availability?startDate=2026-12-21&endDate=2026-12-22`
    );
    expect(conflictAvail.status).toBe(200);
    expect(conflictAvail.body.data.available).toBe(false);

    const freeAvail = await request(app).get(
      `/api/v1/cars/${activeSlug}/availability?startDate=2026-12-22&endDate=2026-12-23`
    );
    expect(freeAvail.status).toBe(200);
    expect(freeAvail.body.data.available).toBe(true);
  });

  it("blocks hard delete of a car that has booking history with 409 CAR_HAS_BOOKINGS", async () => {
    const cookies = await loginAsAdmin();

    const createRes = await request(app)
      .post("/api/v1/admin/cars")
      .set("Cookie", cookies)
      .send({
        name: "Test Unit Protected Delete",
        brand: "Toyota",
        capacityLabel: "5 Kursi",
        pricePerDay: 300000,
        imageUrl: "/Toyota Avanza.jpg",
        status: "AVAILABLE",
      });
    const carId = createRes.body.data.id as string;
    createdCarIds.push(carId);

    await prisma.booking.create({
      data: {
        bookingCode: "BK-CAR-TEST-DEL-001",
        carId,
        carNameSnapshot: "Test Unit Protected Delete",
        customerName: "Tester",
        customerPhone: "6281234567890",
        startDate: new Date("2026-12-25"),
        endDate: new Date("2026-12-26"),
        totalDays: 2,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 600000,
        finalPrice: 600000,
        status: "PENDING",
      },
    });

    const delRes = await request(app)
      .delete(`/api/v1/admin/cars/${carId}`)
      .set("Cookie", cookies);

    expect(delRes.status).toBe(409);
    expect(delRes.body.error.code).toBe("CAR_HAS_BOOKINGS");
  });

  it("allows admin to update car status and hard-delete a car with no bookings", async () => {
    const cookies = await loginAsAdmin();

    const createRes = await request(app)
      .post("/api/v1/admin/cars")
      .set("Cookie", cookies)
      .send({
        name: "Test Unit Deletable",
        brand: "Honda",
        capacityLabel: "5 Kursi",
        pricePerDay: 300000,
        imageUrl: "/Honda Brio.jpeg",
      });
    const carId = createRes.body.data.id as string;

    const statusRes = await request(app)
      .patch(`/api/v1/admin/cars/${carId}/status`)
      .set("Cookie", cookies)
      .send({ status: "MAINTENANCE" });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe("MAINTENANCE");

    const delRes = await request(app)
      .delete(`/api/v1/admin/cars/${carId}`)
      .set("Cookie", cookies);

    expect(delRes.status).toBe(200);
  });
});

