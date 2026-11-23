import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config/env.js";

const validBaseEnv = {
  NODE_ENV: "test",
  PORT: "4000",
  CORS_ORIGIN: "http://localhost:5173",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/kupang_car_rent",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/kupang_car_rent",
  BETTER_AUTH_SECRET: "super-secret-key-at-least-32-chars-long",
  BETTER_AUTH_URL: "http://localhost:4000",
  COOKIE_SAME_SITE: "lax",
  OTP_PROVIDER: "console",
  FONNTE_TOKEN: "",
};

describe("parseEnv", () => {
  it("parses valid environment variables and coerces PORT to number", () => {
    const env = parseEnv(validBaseEnv);

    expect(env.NODE_ENV).toBe("test");
    expect(env.PORT).toBe(4000);
    expect(env.OTP_PROVIDER).toBe("console");
    expect(env.COOKIE_SAME_SITE).toBe("lax");
  });

  it("throws when BETTER_AUTH_SECRET is shorter than 32 characters", () => {
    expect(() =>
      parseEnv({
        ...validBaseEnv,
        BETTER_AUTH_SECRET: "too-short",
      })
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("throws when OTP_PROVIDER is fonnte without FONNTE_TOKEN", () => {
    expect(() =>
      parseEnv({
        ...validBaseEnv,
        OTP_PROVIDER: "fonnte",
        FONNTE_TOKEN: "",
      })
    ).toThrow(/FONNTE_TOKEN/);
  });

  it("throws when DATABASE_URL is missing", () => {
    const { DATABASE_URL: _, ...withoutDb } = validBaseEnv;
    expect(() => parseEnv(withoutDb)).toThrow(/DATABASE_URL/);
  });
});

