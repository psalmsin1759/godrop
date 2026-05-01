import { z } from "zod";

export const initPaymentSchema = z.object({
  orderId: z.string(),
  method: z.enum(["card", "wallet", "cash"]),
});

export const verifyPaymentSchema = z.object({ reference: z.string() });
