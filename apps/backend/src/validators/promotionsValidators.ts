import { z } from "zod";

export const applyPromoSchema = z.object({
  code: z.string().min(1),
  orderType: z.string().min(1),
  amountKobo: z.number().int().positive(),
});
