import "dotenv/config";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { createAuth } from "../../src/lib/auth.js";
import type { OtpSender } from "../../src/lib/otpSender.js";
import { createPrismaClient } from "../../src/lib/prisma.js";

const connectionString = process.env.DATABASE_URL;

describe("Better Auth & requireAdmin guard", () => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for auth integration tests");
  }

  const prisma = createPrismaClient(connectionString);
  const sentOtps: Array<{ to: string; otp: string }> = [];
  const mockOtpSender: OtpSender = {
    send: vi.fn(async ({ to, otp }) => {
      sentOtps.push({ to, otp });
    }),
  };

  const auth = createAuth({
    prisma,
    secret: "test-secret-key-at-least-32-characters-long",
    baseUrl: "http://localhost:4000",
    corsOrigin: "http://localhost:5173",
    cookieSameSite: "lax",
    isProduction: false,
    otpSender: mockOtpSender,
  });

  const app = createApp({
    corsOrigin: "http://localhost:5173",
    nodeEnv: "test",
    auth,
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@aventrarental.id";
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "aventra-admin-2026";

  beforeAll(async () => {
    sentOtps.length = 0;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("blocks public admin registration via /api/auth/sign-up/email", async () => {
    const res = await request(app).post("/api/auth/sign-up/email").send({
      name: "Intruder",
      email: "intruder@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("EMAIL_PASSWORD_SIGN_UP_DISABLED");
  });

  it("rejects unauthenticated access to /api/v1/admin/me with 401", async () => {
    const res = await request(app).get("/api/v1/admin/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi admin tidak valid atau sudah berakhir.",
      },
    });
  });

  it("logs in with email, sets HttpOnly cookie, accesses /api/v1/admin/me, and signs out", async () => {
    const loginRes = await request(app).post("/api/auth/sign-in/email").send({
      email: adminEmail,
      password: adminPassword,
    });

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("HttpOnly");

    const meRes = await request(app)
      .get("/api/v1/admin/me")
      .set("Cookie", cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data).toMatchObject({
      email: adminEmail,
      username: adminUsername,
      role: "ADMIN",
    });

    const signOutRes = await request(app)
      .post("/api/auth/sign-out")
      .set("Cookie", cookies);

    expect(signOutRes.status).toBe(200);

    const meAfterSignOut = await request(app)
      .get("/api/v1/admin/me")
      .set("Cookie", cookies);

    expect(meAfterSignOut.status).toBe(401);
  });

  it("logs in with username and rejects wrong password", async () => {
    const badRes = await request(app).post("/api/auth/sign-in/username").send({
      username: adminUsername,
      password: "wrong-password",
    });
    expect(badRes.status).toBe(401);

    const okRes = await request(app).post("/api/auth/sign-in/username").send({
      username: adminUsername,
      password: adminPassword,
    });
    expect(okRes.status).toBe(200);
    expect(okRes.body.user.username).toBe(adminUsername);
  });

  it("sends 6-digit OTP to BusinessProfile WhatsApp and resets password", async () => {
    const reqOtpRes = await request(app)
      .post("/api/auth/email-otp/request-password-reset")
      .send({ email: adminEmail });

    expect(reqOtpRes.status).toBe(200);
    expect(sentOtps.length).toBeGreaterThanOrEqual(1);

    const lastOtp = sentOtps[sentOtps.length - 1]!;
    expect(lastOtp.to).toBe("6281238989891");
    expect(lastOtp.otp).toMatch(/^\d{6}$/);

    const tempPassword = "new-aventra-password-2026";
    const resetRes = await request(app)
      .post("/api/auth/email-otp/reset-password")
      .send({
        email: adminEmail,
        otp: lastOtp.otp,
        password: tempPassword,
      });

    expect(resetRes.status).toBe(200);

    const loginNewRes = await request(app).post("/api/auth/sign-in/email").send({
      email: adminEmail,
      password: tempPassword,
    });
    expect(loginNewRes.status).toBe(200);

    // Restore original seed password so dev seed remains usable
    await request(app)
      .post("/api/auth/email-otp/request-password-reset")
      .send({ email: adminEmail });
    const restoreOtp = sentOtps[sentOtps.length - 1]!.otp;
    await request(app).post("/api/auth/email-otp/reset-password").send({
      email: adminEmail,
      otp: restoreOtp,
      password: adminPassword,
    });
  });
});

