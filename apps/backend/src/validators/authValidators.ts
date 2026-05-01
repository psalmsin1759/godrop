import { z } from "zod";

const phone = z
  .string()
  .regex(/^\+234\d{10}$/, "Phone must be in E.164 format: +234XXXXXXXXXX");

export const requestOtpSchema = z.object({ phone });

export const verifyOtpSchema = z.object({
  phone,
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const registerSchema = z.object({
  phone,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  referralCode: z.string().optional(),
});

export const refreshTokenSchema = z.object({ refreshToken: z.string() });

export const logoutSchema = z.object({ refreshToken: z.string() });
