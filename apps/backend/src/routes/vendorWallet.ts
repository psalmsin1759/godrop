import { Router } from "express";
import { requireVendorAuth, requireVendorRole } from "../middleware/vendorAuth";
import { validate } from "../middleware/validate";
import * as vendorWalletController from "../controllers/vendorWalletController";
import {
  saveBankAccountSchema,
  withdrawSchema,
  resolveAccountSchema,
} from "../validators/vendorWalletValidators";

const router = Router();

router.use(requireVendorAuth);

router.get("/", vendorWalletController.getWallet);
router.get("/transactions", vendorWalletController.getTransactions);
router.get("/banks", vendorWalletController.getBanks);
router.post("/resolve-account", validate(resolveAccountSchema), vendorWalletController.resolveAccount);
router.get("/bank-account", vendorWalletController.getBankAccount);
router.post("/bank-account", validate(saveBankAccountSchema), vendorWalletController.saveBankAccount);
router.post("/withdraw", requireVendorRole("OWNER"), validate(withdrawSchema), vendorWalletController.withdraw);

export default router;
