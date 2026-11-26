import { describe, expect, it, vi } from "vitest";
import { BookingService } from "../../src/modules/bookings/booking.service.js";
import type { BookingRepository } from "../../src/modules/bookings/booking.repository.js";
import { TestimonialService } from "../../src/modules/testimonials/testimonial.service.js";
import type { TestimonialRepository } from "../../src/modules/testimonials/testimonial.repository.js";

function makeBookingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "bk-1",
    bookingCode: "BK-20261126-A482910",
    idempotencyKey: "idem-key-12345678",
    carId: "car-1",
    carUnitId: "unit-1",
    carNameSnapshot: "Toyota Avanza",
    carUnitLabelSnapshot: "DH 1234 AA",
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
    paymentScheme: "DP_50",
    paymentStatus: "UNPAID",
    paidAmount: 0,
    status: "CONFIRMED",
    internalNote: "RAHASIA_ADMIN_NOTE",
    createdAt: new Date("2026-11-26T00:00:00.000Z"),
    updatedAt: new Date("2026-11-26T00:00:00.000Z"),
    ...overrides,
  };
}

describe("Phase 2 PII & testimonial security controls", () => {
  it("redacts admin-only fields on public Idempotency-Key replay", async () => {
    const existing = makeBookingRow();
    const repo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(existing),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);
    const result = await service.createBooking(
      {
        carId: "car-1",
        customerName: "Budi Santoso",
        customerPhone: "6281234567890",
        startDate: "2026-12-01",
        endDate: "2026-12-03",
        serviceType: "SELF_DRIVE",
        transmissionPreference: "MATIC",
        paymentScheme: "DP_50",
        pickupLocation: "Bandara El Tari",
      },
      { idempotencyKey: "idem-key-12345678", isAdmin: false }
    );

    expect(result.deduplicated).toBe(true);
    expect((result.booking as Record<string, unknown>).internalNote).toBeUndefined();
    expect((result.booking as Record<string, unknown>).carUnitId).toBeUndefined();
    expect((result.booking as Record<string, unknown>).carUnitLabel).toBeUndefined();
  });

  it("rejects Idempotency-Key reuse when request payload differs", async () => {
    const existing = makeBookingRow();
    const repo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(existing),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);
    await expect(
      service.createBooking(
        {
          carId: "car-other",
          customerName: "Attacker",
          customerPhone: "6289999999999",
          startDate: "2026-12-05",
          endDate: "2026-12-06",
          serviceType: "SELF_DRIVE",
          transmissionPreference: "MANUAL",
          paymentScheme: "FULL",
        },
        { idempotencyKey: "idem-key-12345678", isAdmin: false }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "IDEMPOTENCY_KEY_CONFLICT",
    });
  });

  it("generates non-sequential 6-digit random bookingCode suffix", async () => {
    let capturedCode = "";
    const repo = {
      findByIdempotencyKey: vi.fn().mockResolvedValue(null),
      findCarById: vi.fn().mockResolvedValue({
        id: "car-1",
        name: "Avanza",
        pricePerDay: 300000,
        status: "AVAILABLE",
      }),
      findCarUnits: vi.fn().mockResolvedValue([
        { id: "u1", carId: "car-1", transmission: "MATIC", status: "AVAILABLE" },
      ]),
      findBusyUnitIds: vi.fn().mockResolvedValue(new Set()),
      countByCodePrefix: vi.fn().mockResolvedValue(0),
      create: vi.fn(async (data: { bookingCode: string }) => {
        capturedCode = data.bookingCode;
        return makeBookingRow({ bookingCode: data.bookingCode });
      }),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);
    await service.createBooking(
      {
        carId: "car-1",
        customerName: "Budi",
        customerPhone: "6281234567890",
        startDate: "2026-12-01",
        endDate: "2026-12-03",
        serviceType: "SELF_DRIVE",
        transmissionPreference: "MATIC",
        paymentScheme: "DP_50",
      },
      { isAdmin: false }
    );

    expect(capturedCode).toMatch(/^BK-\d{8}-A\d{6}$/);
  });

  it("omits bookingCode from public listPublished() while retaining it in listAllAdmin()", async () => {
    const row = {
      id: "t-1",
      bookingId: "bk-1",
      bookingCode: "BK-20261126-A482910",
      customerName: "Siti",
      carName: "Innova",
      tripLabel: "Dengan Sopir",
      rating: 5,
      quote: "Sangat memuaskan dan tepat waktu.",
      status: "PUBLISHED",
      createdAt: new Date("2026-11-26T00:00:00.000Z"),
      updatedAt: new Date("2026-11-26T00:00:00.000Z"),
    };

    const repo = {
      findPublished: vi.fn().mockResolvedValue([row]),
      findAll: vi.fn().mockResolvedValue([row]),
    } as unknown as TestimonialRepository;

    const service = new TestimonialService(repo);
    const pub = await service.listPublished();
    const admin = await service.listAllAdmin();

    expect(pub[0]?.bookingCode).toBeUndefined();
    expect(admin[0]?.bookingCode).toBe("BK-20261126-A482910");
  });

  it("uses unified non-oracle reason in checkEligibility and ignores spoofed tripLabel in submitPublic", async () => {
    const repo = {
      findBookingByCode: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ status: "PENDING" })
        .mockResolvedValueOnce({
          id: "bk-1",
          bookingCode: "BK-20261126-A482910",
          customerName: "Siti",
          carNameSnapshot: "Innova",
          serviceType: "WITH_DRIVER",
          status: "COMPLETED",
        }),
      findByBookingCode: vi.fn().mockResolvedValue(null),
      create: vi.fn(async (data: Record<string, unknown>) => ({
        id: "t-2",
        ...data,
        createdAt: new Date("2026-11-26T00:00:00.000Z"),
        updatedAt: new Date("2026-11-26T00:00:00.000Z"),
      })),
    } as unknown as TestimonialRepository;

    const service = new TestimonialService(repo);
    const notFound = await service.checkEligibility("BK-MISSING");
    const pending = await service.checkEligibility("BK-PENDING");
    expect(notFound.reason).toBe(pending.reason);

    const created = await service.submitPublic({
      bookingCode: "BK-20261126-A482910",
      customerName: "Siti",
      rating: 5,
      tripLabel: "SPOOFED_TRIP_LABEL",
      quote: "Pelayanan sangat ramah dan mobil bersih.",
    });
    expect(created.tripLabel).toBe("Dengan Sopir");
  });
});

