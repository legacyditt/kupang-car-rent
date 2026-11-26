import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { createHttpLogger } from "../../src/app.js";
import { createAuth } from "../../src/lib/auth.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";

describe("Phase 1 auth & logging security controls", () => {
  it("disables sign-up in emailOTP plugin and enables revokeSessionsOnPasswordReset", () => {
    const mockPrisma = {
      businessProfile: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    const auth = createAuth({
      prisma: mockPrisma,
      secret: "test-secret-key-at-least-32-characters-long",
      baseUrl: "http://localhost:4000",
      corsOrigin: "http://localhost:5173",
      cookieSameSite: "lax",
      isProduction: false,
      otpSender: { send: vi.fn() },
    });

    expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
    expect(auth.options.emailAndPassword?.revokeSessionsOnPasswordReset).toBe(true);
    expect(auth.options.emailAndPassword?.minPasswordLength).toBeGreaterThanOrEqual(10);

    const emailOtpPlugin = auth.options.plugins?.find((p) => p.id === "email-otp") as
      | { options?: { disableSignUp?: boolean; resendStrategy?: string } }
      | undefined;
    expect(emailOtpPlugin).toBeDefined();
    expect(emailOtpPlugin?.options?.disableSignUp).toBe(true);
    expect(emailOtpPlugin?.options?.resendStrategy).toBe("reuse");
  });

  it("does not fall back to hardcoded WhatsApp number when BusinessProfile is missing", async () => {
    const mockSend = vi.fn();
    const mockPrisma = {
      businessProfile: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    const auth = createAuth({
      prisma: mockPrisma,
      secret: "test-secret-key-at-least-32-characters-long",
      baseUrl: "http://localhost:4000",
      corsOrigin: "http://localhost:5173",
      cookieSameSite: "lax",
      isProduction: false,
      otpSender: { send: mockSend },
    });

    const emailOtpPlugin = auth.options.plugins?.find((p) => p.id === "email-otp") as
      | {
          options?: {
            sendVerificationOTP?: (data: {
              email: string;
              otp: string;
              type: "sign-in" | "email-verification" | "forget-password" | "change-email";
            }) => Promise<void>;
          };
        }
      | undefined;

    await expect(
      emailOtpPlugin?.options?.sendVerificationOTP?.({
        email: "admin@aventrarental.id",
        otp: "123456",
        type: "forget-password",
      })
    ).rejects.toThrow(/WhatsApp/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("uses dedicated adminOtpWhatsapp when provided instead of querying BusinessProfile", async () => {
    const mockSend = vi.fn().mockResolvedValue(undefined);
    const findUnique = vi.fn();
    const mockPrisma = {
      businessProfile: { findUnique },
    } as unknown as PrismaClient;

    const auth = createAuth({
      prisma: mockPrisma,
      secret: "test-secret-key-at-least-32-characters-long",
      baseUrl: "http://localhost:4000",
      corsOrigin: "http://localhost:5173",
      cookieSameSite: "lax",
      isProduction: false,
      otpSender: { send: mockSend },
      adminOtpWhatsapp: "6289999999999",
    });

    const emailOtpPlugin = auth.options.plugins?.find((p) => p.id === "email-otp") as
      | {
          options?: {
            sendVerificationOTP?: (data: {
              email: string;
              otp: string;
              type: "sign-in" | "email-verification" | "forget-password" | "change-email";
            }) => Promise<void>;
          };
        }
      | undefined;

    await emailOtpPlugin?.options?.sendVerificationOTP?.({
      email: "admin@aventrarental.id",
      otp: "654321",
      type: "forget-password",
    });

    expect(findUnique).not.toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith({
      to: "6289999999999",
      otp: "654321",
      type: "forget-password",
    });
  });

  it("redacts cookie, authorization, and set-cookie headers in pinoHttp logs", async () => {
    const chunks: string[] = [];
    const logStream = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk.toString());
        cb();
      },
    });

    const logger = createHttpLogger(logStream);
    const req = Object.assign(new EventEmitter(), {
      method: "GET",
      url: "/api/v1/admin/me",
      headers: {
        cookie: "better-auth.session_token=secret-session-value",
        authorization: "Bearer secret-bearer-token",
      },
      socket: { remoteAddress: "127.0.0.1" },
    }) as unknown as IncomingMessage;

    const res = Object.assign(new EventEmitter(), {
      statusCode: 200,
      getHeaders: () => ({
        "set-cookie": ["better-auth.session_token=secret-set-cookie; HttpOnly"],
      }),
    }) as unknown as ServerResponse;

    await new Promise<void>((resolve) => {
      logger(req, res, () => {
        res.emit("finish");
        resolve();
      });
    });

    const logOutput = chunks.join("");
    expect(logOutput).not.toContain("secret-session-value");
    expect(logOutput).not.toContain("secret-bearer-token");
    expect(logOutput).not.toContain("secret-set-cookie");
    expect(logOutput).toContain("[REDACTED]");
  });
});

