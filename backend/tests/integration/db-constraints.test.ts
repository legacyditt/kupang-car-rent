import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "../../src/lib/prisma.js";

const connectionString = process.env.DATABASE_URL;

describe("PostgreSQL BR-09 & integrity constraints", () => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for DB integration tests");
  }

  const prisma = createPrismaClient(connectionString);
  const testCarId = "test-car-br09-constraint";

  beforeAll(async () => {
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.car.deleteMany({ where: { id: testCarId } });

    await prisma.car.create({
      data: {
        id: testCarId,
        slug: "test-car-br09-constraint",
        name: "Test Car BR-09",
        brand: "Toyota",
        capacityLabel: "7 Kursi",
        pricePerDay: 300000,
        imageUrl: "/Toyota Avanza.jpg",
        status: "AVAILABLE",
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.car.deleteMany({ where: { id: testCarId } });
    await prisma.$disconnect();
  });

  it("allows multiple overlapping PENDING bookings for the same car", async () => {
    const b1 = await prisma.booking.create({
      data: {
        bookingCode: "BK-TEST-PEND-001",
        carId: testCarId,
        carNameSnapshot: "Test Car BR-09",
        customerName: "Pelanggan A",
        customerPhone: "6281234567890",
        startDate: new Date("2026-12-01"),
        endDate: new Date("2026-12-03"),
        totalDays: 3,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        status: "PENDING",
      },
    });

    const b2 = await prisma.booking.create({
      data: {
        bookingCode: "BK-TEST-PEND-002",
        carId: testCarId,
        carNameSnapshot: "Test Car BR-09",
        customerName: "Pelanggan B",
        customerPhone: "6281234567891",
        startDate: new Date("2026-12-02"),
        endDate: new Date("2026-12-04"),
        totalDays: 3,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        status: "PENDING",
      },
    });

    expect(b1.status).toBe("PENDING");
    expect(b2.status).toBe("PENDING");
  });

  it("rejects overlapping CONFIRMED bookings on the same car (exclusion_violation 23P01)", async () => {
    await prisma.booking.create({
      data: {
        bookingCode: "BK-TEST-CONF-001",
        carId: testCarId,
        carNameSnapshot: "Test Car BR-09",
        customerName: "Pelanggan C",
        customerPhone: "6281234567892",
        startDate: new Date("2026-12-10"),
        endDate: new Date("2026-12-12"),
        totalDays: 3,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        status: "CONFIRMED",
      },
    });

    await expect(
      prisma.booking.create({
        data: {
          bookingCode: "BK-TEST-CONF-002",
          carId: testCarId,
          carNameSnapshot: "Test Car BR-09",
          customerName: "Pelanggan D",
          customerPhone: "6281234567893",
          startDate: new Date("2026-12-12"),
          endDate: new Date("2026-12-14"),
          totalDays: 3,
          serviceType: "SELF_DRIVE",
          pricePerDaySnapshot: 300000,
          estimatedPrice: 900000,
          finalPrice: 900000,
          status: "CONFIRMED",
        },
      })
    ).rejects.toThrow(/booking_no_overlap_confirmed_or_active|23P01/);
  });

  it("allows adjacent non-overlapping CONFIRMED bookings", async () => {
    const adjacent = await prisma.booking.create({
      data: {
        bookingCode: "BK-TEST-CONF-003",
        carId: testCarId,
        carNameSnapshot: "Test Car BR-09",
        customerName: "Pelanggan E",
        customerPhone: "6281234567894",
        startDate: new Date("2026-12-13"),
        endDate: new Date("2026-12-15"),
        totalDays: 3,
        serviceType: "SELF_DRIVE",
        pricePerDaySnapshot: 300000,
        estimatedPrice: 900000,
        finalPrice: 900000,
        status: "CONFIRMED",
      },
    });

    expect(adjacent.status).toBe("CONFIRMED");
  });
});

