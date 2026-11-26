import { describe, expect, it, vi } from "vitest";
import { getAllowedPaymentStatuses } from "../../src/modules/bookings/booking.domain.js";
import { createPublicBookingSchema } from "../../src/modules/bookings/booking.schema.js";
import { BookingService } from "../../src/modules/bookings/booking.service.js";
import type { BookingRepository } from "../../src/modules/bookings/booking.repository.js";

function makeBookingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "bk-1",
    bookingCode: "BK-20261126-A482910",
    idempotencyKey: null,
    carId: "car-1",
    carUnitId: "unit-1",
    carNameSnapshot: "Toyota Avanza",
    carUnitLabelSnapshot: "Unit 1 (DH 1234 AA)",
    customerName: "Budi Santoso",
    customerPhone: "6281234567890",
    startDate: new Date("2026-12-01T00:00:00.000Z"),
    endDate: new Date("2026-12-03T00:00:00.000Z"),
    totalDays: 3,
    serviceType: "SELF_DRIVE",
    transmissionPreference: "MATIC",
    pickupLocation: "Bandara El Tari",
    customerNotes: "Catatan",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 900000,
    additionalFee: 0,
    finalPrice: 900000,
    paymentScheme: "FULL",
    paymentStatus: "PAID",
    paidAmount: 900000,
    status: "CONFIRMED",
    internalNote: "",
    createdAt: new Date("2026-11-26T00:00:00.000Z"),
    updatedAt: new Date("2026-11-26T00:00:00.000Z"),
    ...overrides,
  };
}

describe("Phase 3 booking integrity & payment bounds", () => {
  it("enforces max lengths on public booking text fields", () => {
    const res = createPublicBookingSchema.safeParse({
      carId: "car-1",
      customerName: "A".repeat(150),
      customerPhone: "081234567890",
      startDate: "2026-12-01",
      endDate: "2026-12-02",
      serviceType: "SELF_DRIVE",
      customerNotes: "N".repeat(1200),
    });
    expect(res.success).toBe(false);
  });

  it("rejects past startDate and rental duration > 90 days for public bookings", async () => {
    const repo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(null),
      findCarById: vi.fn().mockResolvedValue({
        id: "car-1",
        name: "Avanza",
        pricePerDay: 300000,
        status: "AVAILABLE",
      }),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);

    await expect(
      service.createBooking(
        {
          carId: "car-1",
          customerName: "Budi",
          customerPhone: "6281234567890",
          startDate: "2020-01-01",
          endDate: "2020-01-02",
          serviceType: "SELF_DRIVE",
          transmissionPreference: "MANUAL",
          paymentScheme: "FULL",
        },
        { isAdmin: false }
      )
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_DATE_RANGE" });

    await expect(
      service.createBooking(
        {
          carId: "car-1",
          customerName: "Budi",
          customerPhone: "6281234567890",
          startDate: "2026-12-01",
          endDate: "2027-06-01",
          serviceType: "SELF_DRIVE",
          transmissionPreference: "MANUAL",
          paymentScheme: "FULL",
        },
        { isAdmin: false }
      )
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_DATE_RANGE" });
  });

  it("rejects when requested transmission has no AVAILABLE units instead of falling back", async () => {
    const repo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(null),
      findCarById: vi.fn().mockResolvedValue({
        id: "car-1",
        name: "Avanza",
        pricePerDay: 300000,
        status: "AVAILABLE",
      }),
      findCarUnits: vi.fn().mockResolvedValue([
        { id: "u1", carId: "car-1", transmission: "MANUAL", status: "AVAILABLE" },
      ]),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);
    await expect(
      service.createBooking(
        {
          carId: "car-1",
          customerName: "Budi",
          customerPhone: "6281234567890",
          startDate: "2026-12-01",
          endDate: "2026-12-02",
          serviceType: "SELF_DRIVE",
          transmissionPreference: "MATIC",
          paymentScheme: "FULL",
        },
        { isAdmin: false }
      )
    ).rejects.toMatchObject({ statusCode: 409, code: "SCHEDULE_CONFLICT" });
  });

  it("prevents cross-car carUnitId mismatch and unavailable unit assignment in updateBookingDetails", async () => {
    const existing = makeBookingRow({ status: "CONFIRMED", carId: "car-1", carUnitId: "unit-1" });
    const repo = {
      transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
      findById: vi.fn().mockResolvedValue(existing),
      findCarById: vi.fn().mockResolvedValue({
        id: "car-2",
        name: "Innova",
        pricePerDay: 500000,
        status: "AVAILABLE",
      }),
      findUnitById: vi.fn().mockResolvedValue({
        id: "unit-maint",
        carId: "car-1",
        label: "Unit Maint",
        plateNumber: "DH 9999 XX",
        status: "MAINTENANCE",
      }),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);

    // Changing carId on CONFIRMED booking without providing new carUnitId must fail
    await expect(
      service.updateBookingDetails("bk-1", { carId: "car-2" })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_CAR_UNIT" });

    // Assigning MAINTENANCE unit must fail
    await expect(
      service.updateBookingDetails("bk-1", { carUnitId: "unit-maint" })
    ).rejects.toMatchObject({ statusCode: 409, code: "CAR_UNAVAILABLE" });
  });

  it("rejects finalPrice < paidAmount, downgrades PAID when finalPrice increases, and blocks invalid/regressive payment states", async () => {
    const paidRow = makeBookingRow({
      status: "CONFIRMED",
      finalPrice: 900000,
      paidAmount: 900000,
      paymentScheme: "FULL",
      paymentStatus: "PAID",
    });

    const updateSpy = vi.fn(async (_id: string, data: Record<string, unknown>) => ({
      ...paidRow,
      ...data,
    }));

    const repo = {
      transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
      findById: vi.fn().mockResolvedValue(paidRow),
      findScheduleConflict: vi.fn().mockResolvedValue(null),
      update: updateSpy,
    } as unknown as BookingRepository;

    const service = new BookingService(repo);

    // finalPrice < paidAmount rejected cleanly
    await expect(
      service.updateBookingDetails("bk-1", { finalPrice: 500000 })
    ).rejects.toMatchObject({ statusCode: 400, code: "FINAL_PRICE_BELOW_PAID" });

    // Raising finalPrice on PAID booking downgrades paymentStatus to DP_PAID
    await service.updateBookingDetails("bk-1", { finalPrice: 1200000 });
    expect(updateSpy).toHaveBeenCalledWith(
      "bk-1",
      expect.objectContaining({
        finalPrice: 1200000,
        paymentStatus: "DP_PAID",
      }),
      expect.anything()
    );

    // updatePayment rejects FULL + DP_PAID even if current status is DP_PAID
    const dpRow = makeBookingRow({
      status: "IN_PROGRESS",
      paymentScheme: "DP_50",
      paymentStatus: "DP_PAID",
      paidAmount: 450000,
    });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(dpRow);
    await expect(
      service.updatePayment("bk-1", { paymentScheme: "FULL", paymentStatus: "DP_PAID" })
    ).rejects.toMatchObject({ statusCode: 400 });

    // CONFIRMED PAID cannot regress to UNPAID
    expect(getAllowedPaymentStatuses("CONFIRMED", "FULL", "PAID")).toEqual(["PAID"]);
    expect(getAllowedPaymentStatuses("CONFIRMED", "DP_50", "DP_PAID")).toEqual([
      "DP_PAID",
      "PAID",
    ]);
  });
});

