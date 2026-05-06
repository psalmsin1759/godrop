import { z } from "zod";
import { OrderStatus, OrderType } from "@prisma/client";

const guarantorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  relationship: z.string().min(1),
  address: z.string().optional(),
  occupation: z.string().optional(),
});

export const riderRequestOtpSchema = z.object({
  phone: z.string().min(7).max(20),
});

export const riderVerifyOtpSchema = z.object({
  phone: z.string().min(7).max(20),
  otp: z.string().length(6),
});

export const riderRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const riderLogoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateRiderProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().nullish(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullish(),
  streetAddress: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  landmark: z.string().nullish(),
  emergencyContactName: z.string().nullish(),
  emergencyContactPhone: z.string().nullish(),
  emergencyContactRelationship: z.string().nullish(),
  guarantors: z.array(guarantorSchema).max(3).nullish(),
});

export const submitKycSchema = z.object({
  vehicleType: z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"]).optional(),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().min(1990).max(2030).optional(),
  driverLicenseNumber: z.string().optional(),
  driverLicenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  vehicleInsuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bvn: z.string().length(11).optional(),
  nin: z.string().length(11).optional(),
  guarantors: z.array(guarantorSchema).max(3).optional(),
  documents: z.record(z.string()).optional(),
});

export const updateBankAccountSchema = z.object({
  bankName: z.string().min(1),
  bankCode: z.string().min(1),
  accountNumber: z.string().min(10).max(10),
  accountName: z.string().min(1),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url(),
});

export const setAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const pushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

export const removePushTokenSchema = z.object({
  token: z.string().min(1),
});

export const riderOrderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const availableOrdersQuerySchema = z.object({
  type: z.nativeEnum(OrderType).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const rejectOrderSchema = z.object({
  reason: z.string().min(1).optional(),
});

export const markDeliveredSchema = z.object({
  proofNote: z.string().optional(),
});

export const markFailedSchema = z.object({
  reason: z.string().min(1),
});

export const locationUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const withdrawalSchema = z.object({
  amountKobo: z.number().int().positive(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

export const earningsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const notificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
