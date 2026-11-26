import { z } from "zod";
import {
  CarStatus,
  TransmissionPreference,
} from "../../generated/prisma/client.js";
import { isSafeImageUrl } from "../../utils/safeImageUrl.js";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const carTransmissionSchema = z.enum(["MATIC", "MANUAL", "BOTH"]);

export const createCarUnitSchema = z.object({
  label: z.string().trim().min(1, "Nama/label unit wajib diisi."),
  plateNumber: z.string().trim().min(2, "Plat nomor wajib diisi.").toUpperCase(),
  transmission: z.enum(TransmissionPreference).default("MANUAL"),
  status: z.enum(CarStatus).default("AVAILABLE"),
});

export const updateCarUnitSchema = createCarUnitSchema.partial();

export const createCarSchema = z.object({
  name: z.string().trim().min(1, "Nama unit wajib diisi."),
  brand: z.string().trim().optional().default("-"),
  transmission: carTransmissionSchema.default("BOTH"),
  description: z.string().trim().optional(),
  capacityLabel: z.string().trim().min(1).default("— Kursi"),
  pricePerDay: z.coerce.number().int().nonnegative(),
  imageUrl: z
    .string()
    .trim()
    .min(1)
    .refine(isSafeImageUrl, {
      message: "URL gambar harus berupa path relatif, HTTPS, atau gambar PNG/JPEG/WEBP.",
    })
    .default("/Toyota Avanza.jpg"),
  status: z.enum(CarStatus).default("AVAILABLE"),
  plateNumber: z.string().trim().optional(),
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
    transmission: z.enum(TransmissionPreference).optional(),
  })
  .refine((q) => q.endDate >= q.startDate, {
    message: "endDate harus sama atau setelah startDate.",
    path: ["endDate"],
  });

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type UpdateCarStatusInput = z.infer<typeof updateCarStatusSchema>;
export type CreateCarUnitInput = z.infer<typeof createCarUnitSchema>;
export type UpdateCarUnitInput = z.infer<typeof updateCarUnitSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
