import { Router } from "express";
import * as investorController from "../controllers/investorController";
import { validate } from "../middleware/validate";
import { requireInvestorAuth } from "../middleware/investorAuth";
import { documentUpload } from "../middleware/upload";
import {
  investorRegisterSchema,
  investorOtpRequestSchema,
  investorOtpVerifySchema,
  investorLoginSchema,
  investorRefreshSchema,
  investorLogoutSchema,
  investorUpdateProfileSchema,
  investmentPreviewSchema,
  createInvestmentSchema,
  verifyInvestmentSchema,
  fundWalletSchema,
  verifyFundingSchema,
  withdrawSchema,
  createVaultSchema,
  vaultWithdrawSchema,
  addBankAccountSchema,
  submitBvnSchema,
  updateSettingsSchema,
} from "../validators/investorValidators";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────
router.post("/auth/register", validate(investorRegisterSchema), investorController.register);
router.post("/auth/otp/request", validate(investorOtpRequestSchema), investorController.requestOtp);
router.post("/auth/otp/verify", validate(investorOtpVerifySchema), investorController.verifyOtp);
router.post("/auth/login", validate(investorLoginSchema), investorController.login);
router.post("/auth/refresh", validate(investorRefreshSchema), investorController.refreshToken);
router.post("/auth/logout", validate(investorLogoutSchema), investorController.logout);

// ─── Home ─────────────────────────────────────────────────────
router.get("/home", requireInvestorAuth, investorController.home);

// ─── Assets & plans ───────────────────────────────────────────
router.get("/assets", requireInvestorAuth, investorController.listAssets);
router.get("/assets/:id", requireInvestorAuth, investorController.getAsset);
router.get("/plans", requireInvestorAuth, investorController.listPlans);

// ─── Investments ──────────────────────────────────────────────
router.post(
  "/investments/preview",
  requireInvestorAuth,
  validate(investmentPreviewSchema),
  investorController.previewInvestment
);
router.post(
  "/investments",
  requireInvestorAuth,
  validate(createInvestmentSchema),
  investorController.createInvestment
);
router.post(
  "/investments/verify",
  requireInvestorAuth,
  validate(verifyInvestmentSchema),
  investorController.verifyInvestment
);
router.get("/investments", requireInvestorAuth, investorController.listInvestments);
router.get("/investments/:id", requireInvestorAuth, investorController.getInvestment);

// ─── Wallet ───────────────────────────────────────────────────
router.get("/wallet", requireInvestorAuth, investorController.getWallet);
router.post("/wallet/fund", requireInvestorAuth, validate(fundWalletSchema), investorController.fundWallet);
router.post(
  "/wallet/fund/verify",
  requireInvestorAuth,
  validate(verifyFundingSchema),
  investorController.verifyFunding
);
router.post("/wallet/withdraw", requireInvestorAuth, validate(withdrawSchema), investorController.withdraw);
router.get("/wallet/transactions", requireInvestorAuth, investorController.listTransactions);

// ─── Flow Safe ────────────────────────────────────────────────
router.get("/safe", requireInvestorAuth, investorController.getSafe);
router.post("/safe/vaults", requireInvestorAuth, validate(createVaultSchema), investorController.createVault);
router.post(
  "/safe/vaults/:id/withdraw",
  requireInvestorAuth,
  validate(vaultWithdrawSchema),
  investorController.withdrawFromVault
);

// ─── Profile ──────────────────────────────────────────────────
router.get("/me", requireInvestorAuth, investorController.me);
router.patch("/me", requireInvestorAuth, validate(investorUpdateProfileSchema), investorController.updateMe);

// ─── Banks ────────────────────────────────────────────────────
router.get("/banks", requireInvestorAuth, investorController.listBanks);
router.get("/bank-accounts", requireInvestorAuth, investorController.listBankAccounts);
router.post(
  "/bank-accounts",
  requireInvestorAuth,
  validate(addBankAccountSchema),
  investorController.addBankAccount
);
router.patch("/bank-accounts/:id/primary", requireInvestorAuth, investorController.setPrimaryBankAccount);
router.delete("/bank-accounts/:id", requireInvestorAuth, investorController.deleteBankAccount);

// ─── KYC ──────────────────────────────────────────────────────
router.get("/kyc", requireInvestorAuth, investorController.getKyc);
router.post("/kyc/bvn", requireInvestorAuth, validate(submitBvnSchema), investorController.submitBvn);
router.post("/kyc/id", requireInvestorAuth, documentUpload.single("document"), investorController.submitIdDocument);
router.post(
  "/kyc/address",
  requireInvestorAuth,
  documentUpload.single("document"),
  investorController.submitAddressProof
);

// ─── Settings ─────────────────────────────────────────────────
router.get("/settings", requireInvestorAuth, investorController.getSettings);
router.patch("/settings", requireInvestorAuth, validate(updateSettingsSchema), investorController.updateSettings);

// ─── Notifications ────────────────────────────────────────────
router.get("/notifications", requireInvestorAuth, investorController.listNotifications);
router.patch("/notifications/read-all", requireInvestorAuth, investorController.markAllNotificationsRead);
router.patch("/notifications/:id/read", requireInvestorAuth, investorController.markNotificationRead);

// ─── Support ──────────────────────────────────────────────────
router.get("/support/faqs", requireInvestorAuth, investorController.getFaqs);

export default router;
