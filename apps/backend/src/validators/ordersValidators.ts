import { z } from "zod";

export const listOrdersSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

export const rateOrderSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
