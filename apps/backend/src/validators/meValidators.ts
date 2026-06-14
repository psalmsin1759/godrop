import { z } from "zod";
import { toKobo } from "../utils/currency";

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

export const removePushTokenSchema = z.object({
  token: z.string().min(1),
});

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string()).optional(),
});

export const topUpSchema = z.object({
  amount: z.number().positive().min(100, "Minimum top-up is ₦100"),
}).transform((data) => ({ amountKobo: toKobo(data.amount) }));

export const verifyTopUpSchema = z.object({ reference: z.string() });

export const toggleFavoriteSchema = z.object({
  vendorId: z.string().min(1),
});
