import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { createAuth } from "./lib/auth.js";
import { createOtpSender } from "./lib/otpSender.js";
import { getPrisma } from "./lib/prisma.js";

const env = getEnv();
const prisma = getPrisma();
const otpSender = createOtpSender({
  provider: env.OTP_PROVIDER,
  fonnteToken: env.FONNTE_TOKEN,
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
});

const server = app.listen(env.PORT, () => {
  console.log(
    `[server] kupang-car-rent-backend listening on http://localhost:${env.PORT} (${env.NODE_ENV})`
  );
});

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
