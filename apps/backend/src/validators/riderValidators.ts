import { z } from "zod";
import { RiderKycStatus } from "@prisma/client";

const guarantorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  relationship: z.string().min(1),
  address: z.string().optional(),
  occupation: z.string().optional(),
});

const riderBaseSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  landmark: z.string().optional(),
  vehicleType: z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"]).optional(),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().min(1990).max(2030).optional(),
  driverLicenseNumber: z.string().optional(),
  driverLicenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  vehicleInsuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  bvn: z.string().length(11).optional(),
  nin: z.string().length(11).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  guarantors: z.array(guarantorSchema).max(3).optional(),
});

export const createRiderSchema = riderBaseSchema;

export const updateRiderSchema = riderBaseSchema.partial().extend({
  email: z.string().email().nullish(),
  isActive: z.boolean().optional(),
});

export const updateRiderKycSchema = z.object({
  status: z.nativeEnum(RiderKycStatus),
  notes: z.string().optional(),
});

export const riderQuerySchema = z.object({
  search: z.string().optional(),
  kycStatus: z.nativeEnum(RiderKycStatus).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const riderOrderQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const assignOrderSchema = z.object({
  orderId: z.string().min(1),
});

export const processWithdrawalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});
