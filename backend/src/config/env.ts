import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN wajib diisi"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL wajib diisi").optional(),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET minimal 32 karakter"),
    BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL harus berupa URL valid"),
    COOKIE_SAME_SITE: z.enum(["lax", "none", "strict"]).default("lax"),
    OTP_PROVIDER: z.enum(["console", "fonnte"]).default("console"),
    FONNTE_TOKEN: z.string().optional().default(""),
    ADMIN_OTP_WHATSAPP: z.string().optional().default(""),
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
    CLOUDINARY_API_KEY: z.string().optional().default(""),
    CLOUDINARY_API_SECRET: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production" && data.OTP_PROVIDER === "console") {
      ctx.addIssue({
        code: "custom",
        path: ["OTP_PROVIDER"],
        message: "OTP_PROVIDER=console tidak diizinkan saat NODE_ENV=production",
      });
    }
    if (data.OTP_PROVIDER === "fonnte" && data.FONNTE_TOKEN.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["FONNTE_TOKEN"],
        message: "FONNTE_TOKEN wajib diisi saat OTP_PROVIDER=fonnte",
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

/** Validates and normalizes process environment variables with fail-fast errors. */
export function parseEnv(raw: Record<string, string | undefined>): AppEnv {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.data;
}

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}

