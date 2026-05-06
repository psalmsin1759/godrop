import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireRiderAuth } from "../middleware/riderAuth";
import * as ctrl from "../controllers/riderAppController";
import {
  riderRequestOtpSchema,
  riderVerifyOtpSchema,
  riderRefreshTokenSchema,
  riderLogoutSchema,
  updateRiderProfileSchema,
  submitKycSchema,
  updateBankAccountSchema,
  updateAvatarSchema,
  setAvailabilitySchema,
  updateLocationSchema,
  pushTokenSchema,
  removePushTokenSchema,
  riderOrderQuerySchema,
  availableOrdersQuerySchema,
  rejectOrderSchema,
  markDeliveredSchema,
  markFailedSchema,
  locationUpdateSchema,
  withdrawalSchema,
  earningsQuerySchema,
  notificationsQuerySchema,
} from "../validators/riderAppValidators";

const router = Router();

// ─── Auth (public) ─────────────────────────────────────────────
router.post("/auth/request-otp", validate(riderRequestOtpSchema), ctrl.requestOtp);
router.post("/auth/verify-otp", validate(riderVerifyOtpSchema), ctrl.verifyOtp);
router.post("/auth/refresh", validate(riderRefreshTokenSchema), ctrl.refreshToken);
router.post("/auth/logout", validate(riderLogoutSchema), ctrl.logout);

// ─── Authenticated ─────────────────────────────────────────────
router.use(requireRiderAuth);

// Profile
router.get("/me", ctrl.getMe);
router.patch("/me", validate(updateRiderProfileSchema), ctrl.updateMe);
router.patch("/me/avatar", validate(updateAvatarSchema), ctrl.updateAvatar);
router.post("/me/kyc", validate(submitKycSchema), ctrl.submitKyc);
router.patch("/me/bank", validate(updateBankAccountSchema), ctrl.updateBankAccount);
router.patch("/me/availability", validate(setAvailabilitySchema), ctrl.setAvailability);
router.post("/me/location", validate(updateLocationSchema), ctrl.updateLocation);
router.post("/me/push-token", validate(pushTokenSchema), ctrl.registerPushToken);
router.delete("/me/push-token", validate(removePushTokenSchema), ctrl.removePushToken);

// Orders
router.get("/orders/available", validate(availableOrdersQuerySchema, "query"), ctrl.listAvailableOrders);
router.get("/orders", validate(riderOrderQuerySchema, "query"), ctrl.listOrders);
router.get("/orders/active", ctrl.getActiveOrder);
router.get("/orders/:id", ctrl.getOrder);
router.patch("/orders/:id/accept", ctrl.acceptOrder);
router.patch("/orders/:id/reject", validate(rejectOrderSchema), ctrl.rejectOrder);
router.patch("/orders/:id/picked-up", ctrl.markPickedUp);
router.patch("/orders/:id/in-transit", ctrl.markInTransit);
router.patch("/orders/:id/delivered", validate(markDeliveredSchema), ctrl.markDelivered);
router.patch("/orders/:id/failed", validate(markFailedSchema), ctrl.markFailed);
router.post("/orders/:id/location", validate(locationUpdateSchema), ctrl.pushLocationUpdate);

// Earnings
router.get("/earnings", validate(earningsQuerySchema, "query"), ctrl.listEarnings);
router.get("/earnings/summary", ctrl.getEarningsSummary);
router.post("/earnings/withdrawal", validate(withdrawalSchema), ctrl.requestWithdrawal);
router.get("/earnings/withdrawals", validate(earningsQuerySchema, "query"), ctrl.listWithdrawals);

// Notifications
router.get("/notifications", validate(notificationsQuerySchema, "query"), ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getUnreadCount);
router.patch("/notifications/read-all", ctrl.markAllNotificationsRead);
router.patch("/notifications/:id/read", ctrl.markNotificationRead);

export default router;
