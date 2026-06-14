import { z } from "zod";
import { toKobo } from "../utils/currency";

export const saveBankAccountSchema = z.object({
  bankName: z.string().min(1).max(100),
  bankCode: z.string().min(1).max(20),
  accountNumber: z.string().length(10, "Account number must be exactly 10 digits").regex(/^\d+$/, "Account number must be numeric"),
  accountName: z.string().min(1).max(200),
});

export const withdrawSchema = z.object({
  amount: z.number().positive().min(100, "Minimum withdrawal is ₦100"),
}).transform((data) => ({ amountKobo: toKobo(data.amount) }));

export const resolveAccountSchema = z.object({
  accountNumber: z.string().length(10).regex(/^\d+$/),
  bankCode: z.string().min(1),
});
