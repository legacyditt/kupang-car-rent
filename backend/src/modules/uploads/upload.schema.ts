import { z } from "zod";

/** Request payload for issuing a signed Cloudinary direct-upload token. */
export const createUploadSignatureSchema = z.object({
  target: z.enum(["car-image", "logo"]),
  fileSize: z.number().int().positive("Ukuran file harus lebih dari 0 byte."),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"], {
    error: "Format gambar harus JPG, PNG, atau WEBP.",
  }),
});

export type CreateUploadSignatureInput = z.infer<
  typeof createUploadSignatureSchema
>;

