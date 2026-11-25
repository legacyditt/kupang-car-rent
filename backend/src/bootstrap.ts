import { createApp } from "./app.js";
import { getEnv, type AppEnv } from "./config/env.js";
import { createAuth } from "./lib/auth.js";
import { CloudinaryImageStorage } from "./lib/imageStorage.js";
import { createOtpSender } from "./lib/otpSender.js";
import { getPrisma } from "./lib/prisma.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import type { Express } from "express";

export interface BootstrappedApp {
  app: Express;
  env: AppEnv;
  prisma: PrismaClient;
}

/**
 * Wires environment, database, auth, storage, and Express app in one place
 * so both local HTTP server (`server.ts`) and Vercel Serverless (`api/index.ts`) share identical setup.
 */
export function bootstrapApp(): BootstrappedApp {
  const env = getEnv();
  const prisma = getPrisma();
  const otpSender = createOtpSender({
    provider: env.OTP_PROVIDER,
    fonnteToken: env.FONNTE_TOKEN,
  });
  const imageStorage = new CloudinaryImageStorage({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  });

  const auth = createAuth({
    prisma,
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL,
    corsOrigin: env.CORS_ORIGIN,
    cookieSameSite: env.COOKIE_SAME_SITE,
    isProduction: env.NODE_ENV === "production",
    otpSender,
  });

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    nodeEnv: env.NODE_ENV,
    auth,
    prisma,
    imageStorage,
  });

  return { app, env, prisma };
}

