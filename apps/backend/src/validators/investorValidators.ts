import { z } from "zod";

const phoneSchema = z
  .string()
  .regex(/^\+234\d{10}$/, "Phone must be E.164 format: +234XXXXXXXXXX");

export const investorRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const investorOtpRequestSchema = z.object({
  phone: phoneSchema,
});

export const investorOtpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "OTP code must be 6 digits"),
});

export const investorLoginSchema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const investorRefreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const investorLogoutSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const investorUpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  username: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{3,30}$/, "Username must be 3-30 letters, numbers or underscores")
    .optional(),
  avatarUrl: z.string().url().optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().min(3).optional(),
});

export const investmentPreviewSchema = z.object({
  assetId: z.string().min(1, "assetId is required"),
  planId: z.string().min(1, "planId is required"),
  amountKobo: z.number().int().positive("amountKobo must be a positive integer"),
});

export const createInvestmentSchema = z.object({
  assetId: z.string().min(1, "assetId is required"),
  planId: z.string().min(1, "planId is required"),
  amountKobo: z.number().int().positive("amountKobo must be a positive integer"),
  paymentMethod: z.enum(["WALLET", "CARD", "TRANSFER", "USSD"]),
});

export const verifyInvestmentSchema = z.object({
  reference: z.string().min(1, "reference is required"),
});

export const fundWalletSchema = z.object({
  amountKobo: z
    .number()
    .int()
    .min(10000, "Minimum top-up is ₦100"),
  method: z.enum(["CARD", "TRANSFER", "USSD"]).default("CARD"),
});

export const verifyFundingSchema = z.object({
  reference: z.string().min(1, "reference is required"),
});

export const withdrawSchema = z.object({
  amountKobo: z
    .number()
    .int()
    .min(10000, "Minimum withdrawal is ₦100"),
  wallet: z.enum(["MAIN", "PAYOUT"]).default("MAIN"),
  bankAccountId: z.string().min(1, "bankAccountId is required"),
});

export const createVaultSchema = z.object({
  name: z.string().min(1, "Vault name is required").max(60),
  amountKobo: z
    .number()
    .int()
    .min(100000, "Minimum lock is ₦1,000"),
  lockDays: z
    .number()
    .int()
    .min(0)
    .max(365)
    .optional()
    .describe("Omit or 0 for a flexible vault"),
});

export const vaultWithdrawSchema = z.object({
  amountKobo: z.number().int().positive("amountKobo must be a positive integer"),
});

export const addBankAccountSchema = z.object({
  bankCode: z.string().min(1, "bankCode is required"),
  bankName: z.string().min(1, "bankName is required"),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
});

export const submitBvnSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be 11 digits"),
});

export const updateSettingsSchema = z.object({
  biometricLogin: z.boolean().optional(),
  twoFactorAuth: z.boolean().optional(),
  payoutAlerts: z.boolean().optional(),
  investmentUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
  emailStatements: z.boolean().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  appLockTimeoutMin: z.number().int().min(1).max(60).optional(),
});
