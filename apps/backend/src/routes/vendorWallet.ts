import { Router } from "express";
import { requireVendorAuth } from "../middleware/vendorAuth";
import * as vendorWalletController from "../controllers/vendorWalletController";

const router = Router();

router.use(requireVendorAuth);

router.get("/", vendorWalletController.getWallet);
router.get("/transactions", vendorWalletController.getTransactions);
router.get("/bank-account", vendorWalletController.getBankAccount);
router.post("/bank-account", vendorWalletController.saveBankAccount);
router.post("/withdraw", vendorWalletController.withdraw);

export default router;
