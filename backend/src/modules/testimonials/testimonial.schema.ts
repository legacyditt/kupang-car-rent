import { z } from "zod";
import { TestimonialStatus } from "../../generated/prisma/client.js";

export const eligibilityQuerySchema = z.object({
  kode: z.string().trim().optional().default(""),
});

export const submitPublicTestimonialSchema = z.object({
  bookingCode: z
    .string()
    .trim()
    .min(1, "Kode booking wajib diisi.")
    .transform((v) => v.toUpperCase()),
  customerName: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  tripLabel: z.string().trim().optional().default("Pelanggan Aventra"),
  quote: z
    .string()
    .trim()
    .min(10, "Ulasan minimal 10 karakter."),
});

export const adminUpsertTestimonialSchema = z.object({
  customerName: z.string().trim().min(1, "Nama wajib diisi."),
  carName: z.string().trim().min(1).default("Unit Aventra"),
  tripLabel: z.string().trim().min(1).default("Pelanggan Aventra"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  quote: z.string().trim().min(10, "Ulasan minimal 10 karakter."),
  status: z.enum(TestimonialStatus).default("PUBLISHED"),
});

export const updateTestimonialStatusSchema = z.object({
  status: z.enum(TestimonialStatus),
});

export type EligibilityQuery = z.infer<typeof eligibilityQuerySchema>;
export type SubmitPublicTestimonialInput = z.infer<
  typeof submitPublicTestimonialSchema
>;
export type AdminUpsertTestimonialInput = z.infer<
  typeof adminUpsertTestimonialSchema
>;
export type UpdateTestimonialStatusInput = z.infer<
  typeof updateTestimonialStatusSchema
>;

