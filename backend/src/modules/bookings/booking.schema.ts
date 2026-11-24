import { z } from "zod";
import {
  BookingStatus,
  PaymentScheme,
  PaymentStatus,
  RentalServiceType,
  TransmissionPreference,
} from "../../generated/prisma/client.js";
import { normalizeWhatsAppPhone } from "../../utils/phone.js";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeWhatsAppPhone)
  .refine((v) => v.length >= 10, {
    message: "Nomor WhatsApp pelanggan tidak valid.",
  });

export const createPublicBookingSchema = z
  .object({
    carId: z.string().trim().min(1, "Unit mobil wajib dipilih."),
    customerName: z.string().trim().min(1, "Nama pelanggan wajib diisi."),
    customerPhone: phoneSchema,
    startDate: z
      .string()
      .regex(isoDateRegex, "Format startDate harus YYYY-MM-DD."),
    endDate: z
      .string()
      .regex(isoDateRegex, "Format endDate harus YYYY-MM-DD."),
    serviceType: z.enum(RentalServiceType),
    transmissionPreference: z
      .enum(TransmissionPreference)
      .optional()
      .default("MANUAL"),
    paymentScheme: z.enum(PaymentScheme).optional().default("FULL"),
    pickupLocation: z.string().trim().optional(),
    customerNotes: z.string().trim().optional(),
  })
  .refine((b) => b.endDate >= b.startDate, {
    message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
    path: ["endDate"],
  });

export const adminCreateBookingSchema = createPublicBookingSchema.safeExtend({
  finalPrice: z.coerce.number().int().nonnegative().optional(),
  additionalFee: z.coerce.number().int().nonnegative().optional(),
  internalNote: z.string().trim().optional(),
});

export const updateBookingDetailsSchema = z
  .object({
    customerName: z.string().trim().min(1).optional(),
    customerPhone: phoneSchema.optional(),
    carId: z.string().trim().min(1).optional(),
    startDate: z.string().regex(isoDateRegex).optional(),
    endDate: z.string().regex(isoDateRegex).optional(),
    serviceType: z.enum(RentalServiceType).optional(),
    transmissionPreference: z.enum(TransmissionPreference).optional(),
    additionalFee: z.coerce.number().int().nonnegative().optional(),
    finalPrice: z.coerce.number().int().nonnegative().optional(),
    internalNote: z.string().optional(),
  })
  .refine(
    (b) => !b.startDate || !b.endDate || b.endDate >= b.startDate,
    {
      message: "Tanggal selesai harus sama atau setelah tanggal mulai.",
      path: ["endDate"],
    }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(BookingStatus),
  finalPrice: z.coerce.number().int().nonnegative().optional(),
  internalNote: z.string().optional(),
});

export const updateBookingPaymentSchema = z.object({
  paymentScheme: z.enum(PaymentScheme),
  paymentStatus: z.enum(PaymentStatus),
});

export const extendBookingSchema = z.object({
  newEndDate: z
    .string()
    .regex(isoDateRegex, "Format newEndDate harus YYYY-MM-DD."),
  overrideFinalPrice: z.coerce.number().int().nonnegative().optional(),
});

export const listBookingsQuerySchema = z.object({
  status: z.enum(["ALL", ...Object.values(BookingStatus)]).default("ALL"),
  q: z.string().trim().optional(),
});

export type CreatePublicBookingInput = z.infer<typeof createPublicBookingSchema>;
export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>;
export type UpdateBookingDetailsInput = z.infer<
  typeof updateBookingDetailsSchema
>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
export type UpdateBookingPaymentInput = z.infer<
  typeof updateBookingPaymentSchema
>;
export type ExtendBookingInput = z.infer<typeof extendBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

