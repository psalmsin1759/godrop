import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1),
});

const stopSchema = locationSchema;

// ─── Apartment Type ───────────────────────────────────────────

export const createApartmentTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceKobo: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
});

export const updateApartmentTypeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceKobo: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

// ─── Pricing Config ───────────────────────────────────────────

export const setPerKmSchema = z.object({
  perKmKobo: z.number().int().nonnegative(),
});

export const setPerLoaderSchema = z.object({
  perLoaderKobo: z.number().int().nonnegative(),
});

// ─── Quote & Booking ──────────────────────────────────────────

export const truckQuoteSchema = z.object({
  apartmentTypeId: z.string(),
  numLoaders: z.number().int().nonnegative().default(0),
  pickup: locationSchema,
  dropoff: locationSchema,
  stops: z.array(stopSchema).optional(),
});

export const bookTruckSchema = z.object({
  apartmentTypeId: z.string(),
  numLoaders: z.number().int().nonnegative().default(0),
  pickup: locationSchema,
  dropoff: locationSchema,
  stops: z.array(stopSchema).optional(),
  scheduledAt: z.string().datetime().optional(),
  paymentMethod: z.enum(["card", "wallet", "cash"]),
  notes: z.string().optional(),
});

// ─── Truck Type (vehicle — legacy) ────────────────────────────

export const createTruckTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  capacity: z.string().optional(),
  imageUrl: z.string().url().optional(),
  baseFeeKobo: z.number().int().nonnegative(),
  perKmKobo: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
});

export const updateTruckTypeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  capacity: z.string().optional(),
  imageUrl: z.string().url().optional(),
  baseFeeKobo: z.number().int().nonnegative().optional(),
  perKmKobo: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
