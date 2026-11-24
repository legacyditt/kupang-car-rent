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
      minPasswordLength: 6,
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
        async sendVerificationOTP({ otp, type }) {
          const profile = await options.prisma.businessProfile.findUnique({
            where: { id: "default" },
            select: { whatsappNumber: true },
          });
          const adminWa = profile?.whatsappNumber ?? "6281238989891";
          await options.otpSender.send({ to: adminWa, otp, type });
        },
      }),
    ],
    session: {
      expiresIn: 60 * 60 * 24, // 24 hours
    },
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        secure: options.isProduction,
        sameSite: options.cookieSameSite,
      },
    },
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
