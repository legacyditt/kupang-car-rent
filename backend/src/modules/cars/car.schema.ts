import { z } from "zod";
import { CarStatus } from "../../generated/prisma/client.js";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createCarSchema = z.object({
  name: z.string().trim().min(1, "Nama unit wajib diisi."),
  brand: z.string().trim().min(1, "Merek wajib diisi."),
  category: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  description: z.string().trim().optional(),
  capacityLabel: z.string().trim().min(1).default("— Kursi"),
  pricePerDay: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().trim().min(1).default("/Toyota Avanza.jpg"),
  status: z.enum(CarStatus).default("AVAILABLE"),
});

export const updateCarSchema = createCarSchema.partial();

export const updateCarStatusSchema = z.object({
  status: z.enum(CarStatus),
});

export const availabilityQuerySchema = z
  .object({
    startDate: z
      .string()
      .regex(isoDateRegex, "Format startDate harus YYYY-MM-DD."),
    endDate: z
      .string()
      .regex(isoDateRegex, "Format endDate harus YYYY-MM-DD."),
  })
  .refine((q) => q.endDate >= q.startDate, {
    message: "endDate harus sama atau setelah startDate.",
    path: ["endDate"],
  });

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type UpdateCarStatusInput = z.infer<typeof updateCarStatusSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

