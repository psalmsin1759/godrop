import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export const addAddressSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addAddressSchema.partial();

export const pushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["android", "ios"]),
});

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string()).optional(),
});

export const topUpSchema = z.object({
  amountKobo: z.number().int().min(10000, "Minimum top-up is ₦100"),
});

export const verifyTopUpSchema = z.object({ reference: z.string() });
