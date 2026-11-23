import { z } from "zod";

export const financeQuerySchema = z.object({
  month: z
    .string()
    .refine((v) => v === "ALL" || /^\d{4}-\d{2}$/.test(v), {
      message: "Format month harus ALL atau YYYY-MM.",
    })
    .default("ALL"),
});

export type FinanceQuery = z.infer<typeof financeQuerySchema>;

