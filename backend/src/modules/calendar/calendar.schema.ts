import { z } from "zod";

export const calendarQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format month harus YYYY-MM.")
    .optional(),
  carId: z.string().trim().optional(),
});

export type CalendarQuery = z.infer<typeof calendarQuerySchema>;

