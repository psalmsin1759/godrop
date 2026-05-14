import { z } from "zod";

export const VEHICLE_TYPES = ["BICYCLE", "MOTORCYCLE", "CAR", "VAN"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const onboardRiderSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().regex(/^\+234\d{10}$/, "Phone must be in format +234XXXXXXXXXX"),
  email: z.string().email().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  vehicleType: z.enum(VEHICLE_TYPES),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().min(1990).max(2030).optional(),
  driverLicenseNumber: z.string().optional(),
  driverLicenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  vehicleInsuranceExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bvn: z.string().length(11).optional(),
  nin: z.string().length(11).optional(),
});

export type OnboardRiderInput = z.infer<typeof onboardRiderSchema>;
