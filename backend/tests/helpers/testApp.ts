import request from "supertest";
import { vi } from "vitest";
import { createApp } from "../../src/app.js";
import { createAuth } from "../../src/lib/auth.js";
import type { ImageStorage } from "../../src/lib/imageStorage.js";
import type { OtpSender } from "../../src/lib/otpSender.js";
import { createPrismaClient } from "../../src/lib/prisma.js";

export function createTestHarness() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for integration tests");
  }

  const prisma = createPrismaClient(connectionString);
  const otpSender: OtpSender = {
    send: vi.fn(async () => {}),
  };
  const imageStorage: ImageStorage = {
    uploadBuffer: vi.fn(async ({ folder, filename }) => ({
      url: `https://res.cloudinary.com/test/image/upload/${folder}/${filename}`,
      publicId: `${folder}/${filename}`,
    })),
  };

  const auth = createAuth({
    prisma,
    secret: "test-secret-key-at-least-32-characters-long",
    baseUrl: "http://localhost:4000",
    corsOrigin: "http://localhost:5173",
    cookieSameSite: "lax",
    isProduction: false,
    otpSender,
  });

  const app = createApp({
    corsOrigin: "http://localhost:5173",
    nodeEnv: "test",
    auth,
    prisma,
    imageStorage,
  });

  async function loginAsAdmin(): Promise<string[]> {
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@aventrarental.id",
        password: process.env.SEED_ADMIN_PASSWORD ?? "aventra-admin-2026",
      });
    if (res.status !== 200) {
      throw new Error(`Admin test login failed with status ${res.status}`);
    }
    return res.headers["set-cookie"] as unknown as string[];
  }

  return { prisma, app, auth, imageStorage, otpSender, loginAsAdmin };
}

