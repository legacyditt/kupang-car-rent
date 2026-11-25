import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { CloudinaryImageStorage } from "../src/lib/imageStorage.js";
import { FonnteOtpSender } from "../src/lib/otpSender.js";
import { UploadService } from "../src/modules/uploads/upload.service.js";
import type { PrismaClient } from "../src/generated/prisma/client.js";

describe("Deployment preparation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Cloudinary signed direct upload", () => {
    it("issues a valid signature for car-image up to 5 MB", () => {
      const storage = new CloudinaryImageStorage({
        cloudName: "demo-cloud",
        apiKey: "demo-key",
        apiSecret: "demo-secret",
      });
      const service = new UploadService(storage);

      const res = service.createSignature({
        target: "car-image",
        fileSize: 5 * 1024 * 1024,
        mimeType: "image/jpeg",
      });

      expect(res.cloudName).toBe("demo-cloud");
      expect(res.apiKey).toBe("demo-key");
      expect(res.folder).toBe("aventra-rental/cars");
      expect(res.allowedFormats).toBe("jpg,jpeg,png,webp");
      expect(res.signature).toMatch(/^[a-f0-9]{40}$/);
      expect(res.timestamp).toBeGreaterThan(0);
    });

    it("rejects logo uploads larger than 1 MB", () => {
      const storage = new CloudinaryImageStorage({
        cloudName: "demo-cloud",
        apiKey: "demo-key",
        apiSecret: "demo-secret",
      });
      const service = new UploadService(storage);

      expect(() =>
        service.createSignature({
          target: "logo",
          fileSize: 2 * 1024 * 1024,
          mimeType: "image/png",
        })
      ).toThrowError("Ukuran file melebihi batas maksimum yang diizinkan.");
    });
  });

  describe("GET /api/v1/health DB ping", () => {
    it("returns 200 with connected status when SELECT 1 succeeds", async () => {
      const mockPrisma = {
        $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
      } as unknown as PrismaClient;

      const app = createApp({
        corsOrigin: "http://localhost:5173",
        nodeEnv: "test",
        prisma: mockPrisma,
      });

      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ok");
      expect(res.body.data.database).toBe("connected");
    });

    it("returns 503 when database ping fails", async () => {
      const mockPrisma = {
        $queryRaw: vi.fn().mockRejectedValue(new Error("Connection refused")),
      } as unknown as PrismaClient;

      const app = createApp({
        corsOrigin: "http://localhost:5173",
        nodeEnv: "test",
        prisma: mockPrisma,
      });

      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe("DATABASE_UNAVAILABLE");
    });
  });

  describe("FonnteOtpSender retry backoff", () => {
    it("retries once on 503 and succeeds on second attempt", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("Unavailable", { status: 503 }))
        .mockResolvedValueOnce(new Response("OK", { status: 200 }));

      const sender = new FonnteOtpSender("token-123", 1, 10);
      await sender.send({ to: "6281234567890", otp: "123456", type: "forget-password" });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not retry on 4xx client error", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

      const sender = new FonnteOtpSender("bad-token", 1, 10);
      await expect(
        sender.send({ to: "6281234567890", otp: "123456", type: "forget-password" })
      ).rejects.toThrow("Fonnte API error: HTTP 401");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});

