import { z } from "zod";
import { normalizeWhatsAppPhone } from "../../utils/phone.js";
import { isSafeImageUrl } from "../../utils/safeImageUrl.js";

export const updateBusinessProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Nama bisnis wajib diisi."),
    tagline: z.string().trim().optional(),
    description: z.string().trim().optional(),
    location: z.string().trim().min(1, "Alamat rental wajib diisi."),
    operatingHours: z.string().trim().optional(),
    whatsappNumber: z
      .string()
      .trim()
      .transform(normalizeWhatsAppPhone)
      .refine((v) => v.length >= 10, {
        message: "Nomor WhatsApp admin minimal 10 digit.",
      }),
    logoPath: z
      .string()
      .trim()
      .refine((v) => v === "" || isSafeImageUrl(v), {
        message: "Path logo harus berupa path relatif, HTTPS, atau gambar PNG/JPEG/WEBP.",
      })
      .optional(),
  })
  .strict();

export type UpdateBusinessProfileInput = z.infer<
  typeof updateBusinessProfileSchema
>;

