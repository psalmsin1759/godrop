import { Router } from "express";
import { requireVendorAuth, requireVendorRole } from "../middleware/vendorAuth";
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
// Wallet is money-visibility: STAFF have no business here (withdraw is
// further restricted to OWNER below).
router.use(requireVendorRole("MANAGER"));

router.get("/", vendorWalletController.getWallet);
router.get("/transactions", vendorWalletController.getTransactions);
router.get("/banks", vendorWalletController.getBanks);
router.post("/resolve-account", validate(resolveAccountSchema), vendorWalletController.resolveAccount);
router.get("/bank-account", vendorWalletController.getBankAccount);
router.post(
  "/bank-account",
  requireVendorRole("OWNER"),
  validate(saveBankAccountSchema),
  vendorWalletController.saveBankAccount
);
router.post(
  "/withdraw",
  requireVendorRole("OWNER"),
  validate(withdrawSchema),
  auditVendorAction({ action: "WALLET_WITHDRAWAL", entity: "VendorWallet" }),
  vendorWalletController.withdraw
);

export default router;
