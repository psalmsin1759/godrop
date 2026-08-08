import { Router } from "express";
import { requireVendorAuth, requirePermission, requireOwner } from "../middleware/vendorAuth";
import { validate } from "../middleware/validate";
import { auditVendorAction } from "../middleware/auditLog";
import * as vendorWalletController from "../controllers/vendorWalletController";
import {
  saveBankAccountSchema,
  withdrawSchema,
  resolveAccountSchema,
} from "../validators/vendorWalletValidators";

const router = Router();

router.use(requireVendorAuth);
// Wallet is money-visibility: needs wallet:read (moving money out is
// further restricted to the account owner below, regardless of role).
router.use(requirePermission("wallet:read"));

router.get("/", vendorWalletController.getWallet);
router.get("/transactions", vendorWalletController.getTransactions);
router.get("/banks", vendorWalletController.getBanks);
router.post("/resolve-account", validate(resolveAccountSchema), vendorWalletController.resolveAccount);
router.get("/bank-account", vendorWalletController.getBankAccount);
router.post(
  "/bank-account",
  requireOwner,
  validate(saveBankAccountSchema),
  vendorWalletController.saveBankAccount
);
router.post(
  "/withdraw",
  requireOwner,
  validate(withdrawSchema),
  auditVendorAction({ action: "WALLET_WITHDRAWAL", entity: "VendorWallet" }),
  vendorWalletController.withdraw
);

export default router;
