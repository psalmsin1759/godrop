import { z } from "zod";

export const applyPromoSchema = z.object({
  code: z.string().min(1),
  orderType: z.string().min(1),
  deliveryFeeKobo: z.number().int().nonnegative(),
  orderValueKobo: z.number().int().nonnegative().default(0),
});
