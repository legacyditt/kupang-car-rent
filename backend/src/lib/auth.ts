import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, username } from "better-auth/plugins";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { OtpSender } from "./otpSender.js";

export interface CreateAuthOptions {
  prisma: PrismaClient;
  secret: string;
  baseUrl: string;
  corsOrigin: string;
  cookieSameSite: "lax" | "none" | "strict";
  isProduction: boolean;
  otpSender: OtpSender;
  adminOtpWhatsapp?: string;
}

/** Creates the Better Auth instance with username login, blocked public sign-up, and WA OTP reset. */
export function createAuth(options: CreateAuthOptions) {
  return betterAuth({
    database: prismaAdapter(options.prisma, {
      provider: "postgresql",
    }),
    basePath: "/api/auth",
    baseURL: options.baseUrl,
    secret: options.secret,
    trustedOrigins: [options.corsOrigin],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "ADMIN",
          input: false,
        },
      },
    },
    plugins: [
      username(),
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        disableSignUp: true,
        resendStrategy: "reuse",
        async sendVerificationOTP({ otp, type }) {
          const dedicatedWa = options.adminOtpWhatsapp?.trim();
          let adminWa = dedicatedWa;
          if (!adminWa) {
            const profile = await options.prisma.businessProfile.findUnique({
              where: { id: "default" },
              select: { whatsappNumber: true },
            });
            adminWa = profile?.whatsappNumber?.trim();
          }
          if (!adminWa) {
            throw new Error(
              "Nomor WhatsApp admin untuk OTP belum dikonfigurasi."
            );
          }
          await options.otpSender.send({ to: adminWa, otp, type });
        },
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24, // 24 hours
    },
    rateLimit: {
      window: 60,
      max: 30,
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["x-real-ip", "x-forwarded-for"],
      },
      defaultCookieAttributes: {
        httpOnly: true,
        secure: options.isProduction,
        sameSite: options.cookieSameSite,
      },
    },
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
