import { z } from "zod";

const promotionBase = {
  description: z.string().min(1).max(300),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().int().positive(),
  maxDiscount: z.coerce.number().int().positive().optional(),
  minOrderKobo: z.coerce.number().int().positive().optional(),
  orderTypes: z.array(z.string()).default([]),
  usageLimit: z.coerce.number().int().positive().optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
};

export const createPromotionSchema = z
  .object({
    code: z
      .string()
      .min(2)
      .max(30)
      .transform((s) => s.toUpperCase()),
    ...promotionBase,
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, {
    message: "Percent value must be between 1 and 100",
    path: ["value"],
  })
  .refine((d) => d.validUntil > d.validFrom, {
    message: "validUntil must be after validFrom",
    path: ["validUntil"],
  });

export const updatePromotionSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(30)
    .transform((s) => s.toUpperCase())
    .optional(),
  description: z.string().min(1).max(300).optional(),
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.coerce.number().int().positive().optional(),
  maxDiscount: z.coerce.number().int().positive().nullish(),
  minOrderKobo: z.coerce.number().int().positive().nullish(),
  orderTypes: z.array(z.string()).optional(),
  usageLimit: z.coerce.number().int().positive().nullish(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
