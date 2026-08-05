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

const sizeCategory = z.enum(["small", "medium", "large", "extra_large"]);

// Accepts either the new multi-parcel `dropoffs: [...]` array or the legacy
// single `dropoff: {...}`. Older app builds keep working — the controller
// reads `dropoffs ?? [dropoff]`.
export const parcelQuoteSchema = z
  .object({
    pickup: locationSchema,
    dropoff: locationSchema.optional(),
    dropoffs: z.array(locationSchema).min(1).optional(),
    vehicleTypeId: z.string().optional(),
    weightKg: z.number().positive().optional(),
    sizeCategory: sizeCategory.optional(),
  })
  .refine((d) => d.dropoff || (d.dropoffs && d.dropoffs.length > 0), {
    message: "At least one drop-off is required",
    path: ["dropoffs"],
  });

const phone = z
  .string()
  .regex(/^\+234\d{10}$/, "Phone must be in E.164 format: +234XXXXXXXXXX");

// A single parcel within an order: its own destination, recipient, and
// optional description / weight.
const parcelItemSchema = z.object({
  dropoff: locationSchema,
  recipientName: z.string().min(1),
  recipientPhone: phone,
  packageDescription: z.string().min(1).optional(),
  weightKg: z.number().positive().optional(),
  sizeCategory: sizeCategory.optional(),
});

export const placeParcelOrderSchema = z
  .object({
    pickup: locationSchema,
    vehicleTypeId: z.string().optional(),
    paymentMethod: z.enum(["card", "wallet", "cash"]),
    scheduleAt: z.string().datetime().optional(),
    // New multi-parcel shape:
    parcels: z.array(parcelItemSchema).min(1).optional(),
    // Legacy single-parcel shape (normalized to a 1-element `parcels` array):
    dropoff: locationSchema.optional(),
    packageDescription: z.string().min(1).optional(),
    weightKg: z.number().positive().optional(),
    sizeCategory: sizeCategory.optional(),
    recipientName: z.string().min(1).optional(),
    recipientPhone: phone.optional(),
    couponCode: z.string().min(1).optional(),
  })
  .refine(
    (d) =>
      (d.parcels && d.parcels.length > 0) ||
      (d.dropoff && d.recipientName && d.recipientPhone),
    {
      message: "Provide a `parcels` array or a single dropoff with recipient details",
      path: ["parcels"],
    }
  );
