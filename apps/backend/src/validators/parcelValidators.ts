import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1),
});

export const parcelQuoteSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  weightKg: z.number().positive().optional(),
  sizeCategory: z.enum(["small", "medium", "large", "extra_large"]).optional(),
});

const phone = z
  .string()
  .regex(/^\+234\d{10}$/, "Phone must be in E.164 format: +234XXXXXXXXXX");

export const placeParcelOrderSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  packageDescription: z.string().min(1),
  weightKg: z.number().positive().optional(),
  sizeCategory: z.enum(["small", "medium", "large", "extra_large"]).optional(),
  paymentMethod: z.enum(["card", "wallet", "cash"]),
  recipientName: z.string().min(1),
  recipientPhone: phone,
  scheduleAt: z.string().datetime().optional(),
});
