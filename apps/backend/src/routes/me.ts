import { Router } from "express";
import * as meController from "../controllers/meController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upload } from "../middleware/upload";
import {
  updateProfileSchema,
  addAddressSchema,
  updateAddressSchema,
  pushTokenSchema,
  removePushTokenSchema,
  markNotificationsReadSchema,
  topUpSchema,
  verifyTopUpSchema,
} from "../validators/meValidators";

const router = Router();

router.use(requireAuth);

router.get("/", meController.getProfile);
router.patch("/", validate(updateProfileSchema), meController.updateProfile);
router.post("/avatar", upload.single("file"), meController.uploadAvatar);

router.get("/addresses", meController.listAddresses);
router.post("/addresses", validate(addAddressSchema), meController.addAddress);
router.patch("/addresses/:id", validate(updateAddressSchema), meController.updateAddress);
router.delete("/addresses/:id", meController.deleteAddress);

router.get("/wallet", meController.getWallet);
router.get("/wallet/transactions", meController.getWalletTransactions);
router.post("/wallet/topup", validate(topUpSchema), meController.initTopUp);
router.post("/wallet/topup/verify", validate(verifyTopUpSchema), meController.verifyTopUp);

router.post("/push-token", validate(pushTokenSchema), meController.registerPushToken);
router.delete("/push-token", validate(removePushTokenSchema), meController.removePushToken);

router.get("/notifications", meController.listNotifications);
router.patch("/notifications/read", validate(markNotificationsReadSchema), meController.markNotificationsRead);
router.delete("/notifications/all", meController.deleteAllNotifications);
router.delete("/notifications/:id", meController.deleteNotification);

router.get("/cards", meController.listCards);
router.delete("/cards/:id", meController.deleteCard);
router.patch("/cards/:id/default", meController.setDefaultCard);

export default router;
