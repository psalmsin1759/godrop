import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1),
});

// ─── Vehicle Type CRUD ────────────────────────────────────────

export const createParcelVehicleTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  baseFeeKobo: z.number().int().nonnegative(),
  perKmKobo: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

export const updateParcelVehicleTypeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  baseFeeKobo: z.number().int().nonnegative().optional(),
  perKmKobo: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// ─── Quote & Order ────────────────────────────────────────────

export const parcelQuoteSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  vehicleTypeId: z.string().optional(),
  weightKg: z.number().positive().optional(),
  sizeCategory: z.enum(["small", "medium", "large", "extra_large"]).optional(),
});

const phone = z
  .string()
  .regex(/^\+234\d{10}$/, "Phone must be in E.164 format: +234XXXXXXXXXX");

export const placeParcelOrderSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  vehicleTypeId: z.string().optional(),
  packageDescription: z.string().min(1),
  weightKg: z.number().positive().optional(),
  sizeCategory: z.enum(["small", "medium", "large", "extra_large"]).optional(),
  paymentMethod: z.enum(["card", "wallet", "cash"]),
  recipientName: z.string().min(1),
  recipientPhone: phone,
  scheduleAt: z.string().datetime().optional(),
});
