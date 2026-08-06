import { Router, Request } from "express";
import { validate } from "../middleware/validate";
import { requireRiderAuth } from "../middleware/riderAuth";
import { documentUpload, upload } from "../middleware/upload";
import * as ctrl from "../controllers/riderAppController";
import * as disputeCtrl from "../controllers/disputeController";
import {
  createMyDisputeSchema,
  myDisputeQuerySchema,
  addMyMessageSchema,
} from "../validators/disputeValidators";
import {
  riderRequestOtpSchema,
  riderVerifyOtpSchema,
  riderRefreshTokenSchema,
  riderLogoutSchema,
  riderPasswordLoginSchema,
  riderForgotPasswordSchema,
  riderResetPasswordSchema,
  riderSetPasswordSchema,
  updateRiderProfileSchema,
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
  markDropoffDeliveredSchema,
  markDropoffFailedSchema,
  locationUpdateSchema,
  withdrawalSchema,
  resolveAccountSchema,
  earningsQuerySchema,
  notificationsQuerySchema,
} from "../validators/riderAppValidators";

const router = Router();

// ─── Onboarding (public) ───────────────────────────────────────
router.post(
  "/onboard",
  documentUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "vehiclePapers", maxCount: 5 },
    { name: "governmentId", maxCount: 1 },
    { name: "guarantorGovernmentId", maxCount: 1 },
  ]),
  ctrl.onboardRider
);

// ─── Auth (public) ─────────────────────────────────────────────
router.post("/auth/request-otp", validate(riderRequestOtpSchema), ctrl.requestOtp);
router.post("/auth/verify-otp", validate(riderVerifyOtpSchema), ctrl.verifyOtp);
router.post("/auth/refresh", validate(riderRefreshTokenSchema), ctrl.refreshToken);
router.post("/auth/logout", validate(riderLogoutSchema), ctrl.logout);
router.post("/auth/login", validate(riderPasswordLoginSchema), ctrl.passwordLogin);
router.post("/auth/set-password", validate(riderSetPasswordSchema), ctrl.setPassword);
router.post("/auth/forgot-password", validate(riderForgotPasswordSchema), ctrl.forgotPassword);
router.post("/auth/reset-password", validate(riderResetPasswordSchema), ctrl.resetPassword);

// ─── Authenticated ─────────────────────────────────────────────
router.use(requireRiderAuth);

// Profile
router.get("/me", ctrl.getMe);
router.delete("/me", ctrl.deleteAccount);
router.patch("/me", validate(updateRiderProfileSchema), ctrl.updateMe);
router.patch("/me/avatar", validate(updateAvatarSchema), ctrl.updateAvatar);
router.post(
  "/me/kyc",
  documentUpload.fields([
    { name: "vehiclePapers", maxCount: 5 },
    { name: "governmentId", maxCount: 1 },
    { name: "guarantorGovernmentId", maxCount: 1 },
  ]),
  ctrl.submitKyc
);
router.patch("/me/bank", validate(updateBankAccountSchema), ctrl.updateBankAccount);
router.get("/wallet/banks", ctrl.getBanks);
router.post("/wallet/resolve-account", validate(resolveAccountSchema), ctrl.resolveAccount);
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
// Per-parcel delivery for multi-drop-off orders
router.patch("/orders/:id/dropoffs/:dropoffId/delivered", validate(markDropoffDeliveredSchema), ctrl.markDropoffDelivered);
router.patch("/orders/:id/dropoffs/:dropoffId/failed", validate(markDropoffFailedSchema), ctrl.markDropoffFailed);
router.post("/orders/:id/location", validate(locationUpdateSchema), ctrl.pushLocationUpdate);

// Earnings
router.get("/earnings", validate(earningsQuerySchema, "query"), ctrl.listEarnings);
router.get("/earnings/summary", ctrl.getEarningsSummary);
router.post("/earnings/withdrawal", validate(withdrawalSchema), ctrl.requestWithdrawal);
router.get("/earnings/withdrawals", validate(earningsQuerySchema, "query"), ctrl.listWithdrawals);

// Analytics
router.get("/analytics", ctrl.getAnalytics);

// Disputes
const riderActor = (req: Request) => ({ type: "RIDER" as const, id: req.rider!.id });
router.post("/disputes/upload", upload.single("file"), disputeCtrl.uploadDisputeEvidence);
router.post("/disputes", validate(createMyDisputeSchema), disputeCtrl.createMyDispute(riderActor));
router.get("/disputes", validate(myDisputeQuerySchema, "query"), disputeCtrl.listMyDisputes(riderActor));
router.get("/disputes/unread-count", disputeCtrl.getMyDisputesUnreadCount(riderActor));
router.get("/disputes/:id", disputeCtrl.getMyDispute(riderActor));
router.post("/disputes/:id/messages", validate(addMyMessageSchema), disputeCtrl.addMyMessage(riderActor));

// Notifications
router.get("/notifications", validate(notificationsQuerySchema, "query"), ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getUnreadCount);
router.patch("/notifications/read-all", ctrl.markAllNotificationsRead);
router.patch("/notifications/:id/read", ctrl.markNotificationRead);

export default router;
