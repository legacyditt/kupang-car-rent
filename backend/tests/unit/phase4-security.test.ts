import { EventEmitter } from "node:events";
import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createRequireSameOrigin } from "../../src/middlewares/requireSameOrigin.js";
import { CarService } from "../../src/modules/cars/car.service.js";
import type { CarRepository } from "../../src/modules/cars/car.repository.js";
import { CloudinaryImageStorage } from "../../src/lib/imageStorage.js";

function invokeSameOrigin(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  opts: { method: string; origin?: string; referer?: string; secFetchSite?: string }
) {
  const req = Object.assign(new EventEmitter(), {
    method: opts.method,
    header: (name: string) => {
      const k = name.toLowerCase();
      if (k === "origin") return opts.origin;
      if (k === "referer") return opts.referer;
      if (k === "sec-fetch-site") return opts.secFetchSite;
      return undefined;
    },
  }) as unknown as Request;
  const next = vi.fn();
  middleware(req, {} as Response, next);
  return next;
}

describe("Phase 4 CSRF, Car availability privacy & Cloudinary signature controls", () => {
  it("blocks cross-origin and Sec-Fetch-Site=cross-site mutations on /api/v1/admin/*", () => {
    const mw = createRequireSameOrigin("https://rental.example.com");

    // Cross-origin Origin blocked
    const nextEvilOrigin = invokeSameOrigin(mw, {
      method: "POST",
      origin: "https://evil.example.com",
    });
    expect(nextEvilOrigin.mock.calls[0]?.[0]).toMatchObject({
      statusCode: 403,
      code: "CSRF_FORBIDDEN",
    });

    // Sec-Fetch-Site: cross-site blocked
    const nextCrossSite = invokeSameOrigin(mw, {
      method: "POST",
      secFetchSite: "cross-site",
    });
    expect(nextCrossSite.mock.calls[0]?.[0]).toMatchObject({
      statusCode: 403,
      code: "CSRF_FORBIDDEN",
    });

    // Same-origin allowed
    const nextOk = invokeSameOrigin(mw, {
      method: "POST",
      origin: "https://rental.example.com",
      secFetchSite: "same-origin",
    });
    expect(nextOk).toHaveBeenCalledWith();
  });

  it("hides INACTIVE cars with 404 and omits availableUnitCount in checkAvailability", async () => {
    const repo = {
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce({
          id: "car-inactive",
          slug: "hidden-car",
          status: "INACTIVE",
          units: [],
        })
        .mockResolvedValueOnce({
          id: "car-active",
          slug: "avanza",
          status: "AVAILABLE",
          units: [
            { id: "u1", status: "AVAILABLE", transmission: "MATIC" },
            { id: "u2", status: "AVAILABLE", transmission: "MATIC" },
          ],
        }),
      findConflictingUnitIds: vi.fn().mockResolvedValue([]),
    } as unknown as CarRepository;

    const service = new CarService(repo);

    await expect(
      service.checkAvailability("hidden-car", {
        startDate: "2026-12-01",
        endDate: "2026-12-02",
      })
    ).rejects.toMatchObject({ statusCode: 404, code: "CAR_NOT_FOUND" });

    const res = await service.checkAvailability("avanza", {
      startDate: "2026-12-01",
      endDate: "2026-12-02",
      transmission: "MATIC",
    });
    expect(res.available).toBe(true);
    expect((res as Record<string, unknown>).availableUnitCount).toBeUndefined();
  });

  it("binds a unique server-generated publicId to Cloudinary direct-upload signatures", () => {
    const storage = new CloudinaryImageStorage({
      cloudName: "demo-cloud",
      apiKey: "demo-key",
      apiSecret: "demo-secret",
    });

    const sig1 = storage.createUploadSignature("aventra-rental/cars");
    const sig2 = storage.createUploadSignature("aventra-rental/cars");

    expect(sig1.publicId).toBeTruthy();
    expect(sig2.publicId).toBeTruthy();
    expect(sig1.publicId).not.toBe(sig2.publicId);
  });
});

