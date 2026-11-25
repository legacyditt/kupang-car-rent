import "dotenv/config";
import { defineConfig } from "prisma/config";

const FALLBACK_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/kupang_car_rent?sslmode=disable";

const runtimeEnv = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Fallback allows `prisma generate` to run in CI/build environments without DB credentials.
    url: runtimeEnv?.DATABASE_URL ?? FALLBACK_DATABASE_URL,
  },
});

