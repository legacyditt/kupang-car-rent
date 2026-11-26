import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AuthInstance } from "../../src/lib/auth.js";
import { createRequireAdmin } from "../../src/middlewares/requireAdmin.js";
import { BookingService } from "../../src/modules/bookings/booking.service.js";
import type { BookingRepository } from "../../src/modules/bookings/booking.repository.js";
import { createCarSchema } from "../../src/modules/cars/car.schema.js";
import { updateBusinessProfileSchema } from "../../src/modules/settings/businessProfile.schema.js";

describe("Phase 5 defense-in-depth hardening", () => {
  it("rejects session.user missing role in requireAdmin (fail closed)", async () => {
    const auth = {
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: { id: "u1", email: "user@example.com", name: "User" },
        }),
      },
    } as unknown as AuthInstance;

    const requireAdmin = createRequireAdmin(auth);
    const next = vi.fn() as unknown as NextFunction;

    await requireAdmin(
      { headers: {} } as Request,
      {} as Response,
      next
    );

    expect((next as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("rejects transitionStatus to IN_PROGRESS when carUnitId is null", async () => {
    const repo = {
      transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
      findById: vi.fn().mockResolvedValue({
        id: "bk-1",
        status: "CONFIRMED",
        carUnitId: null,
        paidAmount: 0,
        finalPrice: 300000,
        paymentScheme: "FULL",
        paymentStatus: "UNPAID",
      }),
    } as unknown as BookingRepository;

    const service = new BookingService(repo);
    await expect(
      service.transitionStatus("bk-1", { status: "IN_PROGRESS" })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "CAR_UNIT_REQUIRED",
    });
  });

  it("restricts logoPath and imageUrl to safe relative, https, or raster data URIs", () => {
    expect(
      createCarSchema.safeParse({
        name: "Avanza",
        pricePerDay: 300000,
        imageUrl: "javascript:alert(1)",
      }).success
    ).toBe(false);

    expect(
      createCarSchema.safeParse({
        name: "Avanza",
        pricePerDay: 300000,
        imageUrl: "data:image/svg+xml,<svg onload=alert(1)>",
      }).success
    ).toBe(false);

    expect(
      createCarSchema.safeParse({
        name: "Avanza",
        pricePerDay: 300000,
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/car.jpg",
      }).success
    ).toBe(true);

    expect(
      updateBusinessProfileSchema.safeParse({
        name: "Aventra",
        location: "Kupang",
        whatsappNumber: "081234567890",
        logoPath: "data:image/svg+xml;base64,PHN2Zz4=",
      }).success
    ).toBe(false);

    expect(
      updateBusinessProfileSchema.safeParse({
        name: "Aventra",
        location: "Kupang",
        whatsappNumber: "081234567890",
        logoPath: "/logo-aventra.jpg",
      }).success
    ).toBe(true);
  });
});

