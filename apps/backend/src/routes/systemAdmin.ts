import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireSystemAuth, requirePermission } from "../middleware/systemAuth";
import { auditSystemAction } from "../middleware/auditLog";
import {
  adminLoginSchema,
  createSystemAdminSchema,
  updateSystemAdminSchema,
  rejectVendorSchema,
  suspendVendorSchema,
  auditLogQuerySchema,
  graphQuerySchema,
  adminUpdateOrderStatusSchema,
  adminCancelOrderSchema,
  customerQuerySchema,
  customerOrderQuerySchema,
  updateCustomerStatusSchema,
  walletTxQuerySchema,
  changeAdminPasswordSchema,
  updateAdminProfileSchema,
  updateAdminSettingsSchema,
  forgotAdminPasswordSchema,
  resetAdminPasswordSchema,
  issueManualOtpSchema,
  createRoleSchema,
  updateRoleSchema,
} from "../validators/systemAdminValidators";
import {
  createDisputeSchema,
  disputeQuerySchema,
  addDisputeMessageSchema,
  assignDisputeSchema,
  updateDisputeStatusSchema,
  resolveDisputeSchema,
} from "../validators/disputeValidators";
import * as ctrl from "../controllers/systemAdminController";
import * as roleCtrl from "../controllers/roleController";
import * as disputeCtrl from "../controllers/disputeController";
import * as analyticsCtrl from "../controllers/analyticsController";
import * as riderCtrl from "../controllers/riderController";
import * as businessCtrl from "../controllers/businessAdminController";
import * as fcmCtrl from "../controllers/fcmController";
import * as messagingCtrl from "../controllers/messagingController";
import * as heroCtrl from "../controllers/heroController";
import * as bannerCtrl from "../controllers/bannerController";
import * as promotionsCtrl from "../controllers/promotionsController";
import { upload, documentUpload } from "../middleware/upload";
import {
  sendEmailSingleSchema,
  sendEmailBatchSchema,
  sendEmailAllCustomersSchema,
  sendEmailAllVendorsSchema,
  sendEmailAllRidersSchema,
  requestSmsSenderIdSchema,
} from "../validators/messagingValidators";
import {
  sendToSingleSchema,
  sendToCustomerBatchSchema,
  sendToRiderBatchSchema,
  sendToVendorBatchSchema,
  broadcastSchema,
} from "../validators/fcmValidators";
import {
  createRiderSchema,
  updateRiderSchema,
  updateRiderKycSchema,
  riderQuerySchema,
  riderOrderQuerySchema,
  assignOrderSchema,
  processWithdrawalSchema,
} from "../validators/riderValidators";

const router = Router();

// ─── Public ───────────────────────────────────────────────────
router.post("/login", validate(adminLoginSchema), ctrl.login);
router.post("/forgot-password", validate(forgotAdminPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password", validate(resetAdminPasswordSchema), ctrl.resetPassword);

// ─── Authenticated ────────────────────────────────────────────
router.use(requireSystemAuth);

router.get("/me", ctrl.getMe);
router.post(
  "/me/change-password",
  validate(changeAdminPasswordSchema),
  auditSystemAction({ action: "CHANGE_PASSWORD", entity: "SystemAdmin" }),
  ctrl.changePassword
);
router.patch(
  "/me/profile",
  validate(updateAdminProfileSchema),
  auditSystemAction({ action: "UPDATE_PROFILE", entity: "SystemAdmin" }),
  ctrl.updateProfile
);
router.get("/me/settings", ctrl.getSettings);
router.patch(
  "/me/settings",
  validate(updateAdminSettingsSchema),
  auditSystemAction({ action: "UPDATE_SETTINGS", entity: "SystemAdmin" }),
  ctrl.updateSettings
);

router.get("/platform-settings", requirePermission("settings:read"), ctrl.getPlatformSettings);
router.patch(
  "/platform-settings",
  requirePermission("settings:write"),
  auditSystemAction({ action: "UPDATE_PLATFORM_SETTINGS", entity: "PlatformSettings" }),
  ctrl.updatePlatformSettings
);

// ─── Manual OTP (sensitive) ────────────────────────────────────
router.post(
  "/manual-otp",
  requirePermission("otp:issue"),
  validate(issueManualOtpSchema),
  auditSystemAction({ action: "ISSUE_MANUAL_OTP", entity: "Otp", getEntityId: (r) => r.body.phone }),
  ctrl.issueManualOtp
);
router.post(
  "/messaging/test-otp",
  requirePermission("otp:issue"),
  validate(issueManualOtpSchema),
  auditSystemAction({ action: "TEST_OTP_SMS", entity: "Otp", getEntityId: (r) => r.body.phone }),
  ctrl.testOtpSms
);

// ─── Admin Management ──────────────────────────────────────────
router.get(
  "/admins",
  requirePermission("admins:read"),
  ctrl.listAdmins
);
router.post(
  "/admins",
  requirePermission("admins:write"),
  validate(createSystemAdminSchema),
  auditSystemAction({ action: "CREATE_SYSTEM_ADMIN", entity: "SystemAdmin" }),
  ctrl.createAdmin
);
router.patch(
  "/admins/:id",
  requirePermission("admins:write"),
  validate(updateSystemAdminSchema),
  auditSystemAction({ action: "UPDATE_SYSTEM_ADMIN", entity: "SystemAdmin", getEntityId: (r) => r.params.id }),
  ctrl.updateAdmin
);
router.patch(
  "/admins/:id/email-prefs",
  requirePermission("admins:write"),
  auditSystemAction({ action: "UPDATE_ADMIN_EMAIL_PREFS", entity: "SystemAdmin", getEntityId: (r) => r.params.id }),
  ctrl.updateAdminEmailPrefs
);

// ─── Roles (RBAC) ───────────────────────────────────────────────
router.get("/permissions", requirePermission("roles:read"), roleCtrl.listSystemPermissions);
router.get("/roles", requirePermission("roles:read"), roleCtrl.listRoles);
router.post(
  "/roles",
  requirePermission("roles:write"),
  validate(createRoleSchema),
  auditSystemAction({ action: "CREATE_ROLE", entity: "Role" }),
  roleCtrl.createRole
);
router.patch(
  "/roles/:id",
  requirePermission("roles:write"),
  validate(updateRoleSchema),
  auditSystemAction({ action: "UPDATE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.updateRole
);
router.delete(
  "/roles/:id",
  requirePermission("roles:write"),
  auditSystemAction({ action: "DELETE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.deleteRole
);

// ─── Vendor Management ─────────────────────────────────────────
router.get("/vendors", requirePermission("vendors:read"), ctrl.listVendors);
router.get("/vendors/:id", requirePermission("vendors:read"), ctrl.getVendor);
router.patch(
  "/vendors/:id/approve",
  requirePermission("vendors:write"),
  auditSystemAction({ action: "APPROVE_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.approveVendor
);
router.patch(
  "/vendors/:id/reject",
  requirePermission("vendors:write"),
  validate(rejectVendorSchema),
  auditSystemAction({ action: "REJECT_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.rejectVendor
);
router.patch(
  "/vendors/:id/suspend",
  requirePermission("vendors:write"),
  validate(suspendVendorSchema),
  auditSystemAction({ action: "SUSPEND_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.suspendVendor
);
router.patch(
  "/vendors/:id/reinstate",
  requirePermission("vendors:write"),
  auditSystemAction({ action: "REINSTATE_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.reinstateVendor
);
router.get("/vendors/:id/wallet", requirePermission("vendors:read"), ctrl.getVendorWalletBalance);
router.get("/vendors/:id/withdrawals", requirePermission("vendors:read"), ctrl.getVendorWithdrawals);

// ─── Customer Management ────────────────────────────────────────
router.get(
  "/customers",
  requirePermission("customers:read"),
  validate(customerQuerySchema, "query"),
  ctrl.listCustomers
);
router.get("/customers/:id", requirePermission("customers:read"), ctrl.getCustomer);
router.get(
  "/customers/:id/orders",
  requirePermission("customers:read"),
  validate(customerOrderQuerySchema, "query"),
  ctrl.getCustomerOrders
);
router.patch(
  "/customers/:id/status",
  requirePermission("customers:write"),
  validate(updateCustomerStatusSchema),
  auditSystemAction({ action: "UPDATE_CUSTOMER_STATUS", entity: "User", getEntityId: (r) => r.params.id }),
  ctrl.updateCustomerStatus
);
router.get("/customers/:id/wallet", requirePermission("customers:read"), ctrl.getCustomerWallet);
router.get(
  "/customers/:id/wallet/transactions",
  requirePermission("customers:read"),
  validate(walletTxQuerySchema, "query"),
  ctrl.getCustomerWalletTransactions
);

// ─── Analytics ───────────────────────────────────────────────────
router.get("/analytics", requirePermission("analytics:read"), analyticsCtrl.systemAnalytics);
router.get(
  "/analytics/graph",
  requirePermission("analytics:read"),
  validate(graphQuerySchema, "query"),
  analyticsCtrl.systemGraphData
);

// ─── Audit Logs ────────────────────────────────────────────────
router.get(
  "/audit-logs",
  requirePermission("audit_logs:read"),
  validate(auditLogQuerySchema, "query"),
  ctrl.listAuditLogs
);

// ─── Disputes ────────────────────────────────────────────────────
router.get(
  "/disputes",
  requirePermission("disputes:read"),
  validate(disputeQuerySchema, "query"),
  disputeCtrl.listDisputes
);
router.post(
  "/disputes",
  requirePermission("disputes:write"),
  validate(createDisputeSchema),
  auditSystemAction({ action: "CREATE_DISPUTE", entity: "Dispute" }),
  disputeCtrl.createDispute
);
router.get("/disputes/:id", requirePermission("disputes:read"), disputeCtrl.getDispute);
router.post(
  "/disputes/:id/messages",
  requirePermission("disputes:write"),
  validate(addDisputeMessageSchema),
  auditSystemAction({ action: "ADD_DISPUTE_MESSAGE", entity: "Dispute", getEntityId: (r) => r.params.id }),
  disputeCtrl.addMessage
);
router.patch(
  "/disputes/:id/assign",
  requirePermission("disputes:write"),
  validate(assignDisputeSchema),
  auditSystemAction({ action: "ASSIGN_DISPUTE", entity: "Dispute", getEntityId: (r) => r.params.id }),
  disputeCtrl.assignDispute
);
router.patch(
  "/disputes/:id/status",
  requirePermission("disputes:write"),
  validate(updateDisputeStatusSchema),
  auditSystemAction({ action: "UPDATE_DISPUTE_STATUS", entity: "Dispute", getEntityId: (r) => r.params.id }),
  disputeCtrl.updateStatus
);
router.patch(
  "/disputes/:id/resolve",
  requirePermission("disputes:write"),
  validate(resolveDisputeSchema),
  auditSystemAction({ action: "RESOLVE_DISPUTE", entity: "Dispute", getEntityId: (r) => r.params.id }),
  disputeCtrl.resolveDispute
);

// ─── Orders ──────────────────────────────────────────────────────
router.get("/orders", requirePermission("orders:read"), ctrl.listOrders);
router.get("/orders/:id", requirePermission("orders:read"), ctrl.getOrder);
router.patch(
  "/orders/:id/status",
  requirePermission("orders:write"),
  validate(adminUpdateOrderStatusSchema),
  auditSystemAction({ action: "UPDATE_ORDER_STATUS", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.updateOrderStatus
);
router.patch(
  "/orders/:id/cancel",
  requirePermission("orders:write"),
  validate(adminCancelOrderSchema),
  auditSystemAction({ action: "CANCEL_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.cancelOrder
);

// ─── Notifications (own account — no module permission required) ─
router.get("/notifications", ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getNotificationsUnreadCount);
router.patch(
  "/notifications/read-all",
  auditSystemAction({ action: "MARK_ALL_NOTIFICATIONS_READ", entity: "AdminNotification" }),
  ctrl.markAllNotificationsRead
);
router.patch(
  "/notifications/:id/read",
  auditSystemAction({ action: "MARK_NOTIFICATION_READ", entity: "AdminNotification", getEntityId: (r) => r.params.id }),
  ctrl.markNotificationRead
);

// ─── Riders ──────────────────────────────────────────────────────
router.get("/riders/stats", requirePermission("riders:read"), riderCtrl.getRiderStats);
router.get("/riders/available", requirePermission("riders:read"), riderCtrl.listAvailableRiders);
router.get("/riders", requirePermission("riders:read"), validate(riderQuerySchema, "query"), riderCtrl.listRiders);
router.post(
  "/riders",
  requirePermission("riders:write"),
  validate(createRiderSchema),
  auditSystemAction({ action: "CREATE_RIDER", entity: "Rider" }),
  riderCtrl.createRider
);
router.get("/riders/:id", requirePermission("riders:read"), riderCtrl.getRider);
router.patch(
  "/riders/:id",
  requirePermission("riders:write"),
  validate(updateRiderSchema),
  auditSystemAction({ action: "UPDATE_RIDER", entity: "Rider", getEntityId: (r) => r.params.id }),
  riderCtrl.updateRider
);
router.patch(
  "/riders/:id/kyc",
  requirePermission("riders:write"),
  validate(updateRiderKycSchema),
  auditSystemAction({ action: "UPDATE_RIDER_KYC", entity: "Rider", getEntityId: (r) => r.params.id }),
  riderCtrl.updateRiderKyc
);
router.patch(
  "/riders/:id/toggle-active",
  requirePermission("riders:write"),
  auditSystemAction({ action: "TOGGLE_RIDER_ACTIVE", entity: "Rider", getEntityId: (r) => r.params.id }),
  riderCtrl.toggleRiderActive
);
router.post(
  "/riders/:id/assign-order",
  requirePermission("riders:write"),
  validate(assignOrderSchema),
  auditSystemAction({ action: "ASSIGN_ORDER_TO_RIDER", entity: "Order", getEntityId: (r) => r.body.orderId }),
  riderCtrl.assignOrderToRider
);
router.get(
  "/riders/:id/orders",
  requirePermission("riders:read"),
  validate(riderOrderQuerySchema, "query"),
  riderCtrl.getRiderOrders
);
router.get("/riders/:id/earnings", requirePermission("riders:read"), riderCtrl.getRiderEarnings);
router.patch(
  "/riders/:id/withdrawals/:withdrawalId",
  requirePermission("riders:payouts"),
  validate(processWithdrawalSchema),
  auditSystemAction({ action: "PROCESS_RIDER_WITHDRAWAL", entity: "RiderWithdrawal", getEntityId: (r) => r.params.withdrawalId }),
  riderCtrl.processWithdrawal
);

// ─── Email Messaging ─────────────────────────────────────────────
router.post("/messaging/email/single", requirePermission("messaging:send"), validate(sendEmailSingleSchema), auditSystemAction({ action: "SEND_EMAIL", entity: "Email" }), messagingCtrl.sendEmailSingle);
router.post("/messaging/email/batch", requirePermission("messaging:send"), validate(sendEmailBatchSchema), auditSystemAction({ action: "SEND_EMAIL_BATCH", entity: "Email" }), messagingCtrl.sendEmailBatch);
router.post("/messaging/email/all-customers", requirePermission("messaging:send"), validate(sendEmailAllCustomersSchema), auditSystemAction({ action: "SEND_EMAIL_ALL_CUSTOMERS", entity: "Email" }), messagingCtrl.sendEmailAllCustomers);
router.post("/messaging/email/all-vendors", requirePermission("messaging:send"), validate(sendEmailAllVendorsSchema), auditSystemAction({ action: "SEND_EMAIL_ALL_VENDORS", entity: "Email" }), messagingCtrl.sendEmailAllVendors);
router.post("/messaging/email/all-riders", requirePermission("messaging:send"), validate(sendEmailAllRidersSchema), auditSystemAction({ action: "SEND_EMAIL_ALL_RIDERS", entity: "Email" }), messagingCtrl.sendEmailAllRiders);

// ─── SMS Messaging ───────────────────────────────────────────────
router.get("/messaging/sms/sender-ids", requirePermission("messaging:send"), messagingCtrl.listSmsSenderIds);
router.post("/messaging/sms/sender-ids/request", requirePermission("messaging:send"), validate(requestSmsSenderIdSchema), auditSystemAction({ action: "REQUEST_SMS_SENDER_ID", entity: "SmsSenderId" }), messagingCtrl.requestSmsSenderId);

// ─── Push Notifications ──────────────────────────────────────────
router.post("/push/customers/broadcast", requirePermission("push:send"), validate(broadcastSchema), auditSystemAction({ action: "BROADCAST_PUSH_CUSTOMERS", entity: "PushNotification" }), fcmCtrl.broadcastToCustomers);
router.post("/push/customers/batch", requirePermission("push:send"), validate(sendToCustomerBatchSchema), auditSystemAction({ action: "SEND_PUSH_CUSTOMER_BATCH", entity: "PushNotification" }), fcmCtrl.notifyCustomerBatch);
router.post("/push/customers/:id", requirePermission("push:send"), validate(sendToSingleSchema), auditSystemAction({ action: "SEND_PUSH_CUSTOMER", entity: "PushNotification", getEntityId: (r) => r.params.id }), fcmCtrl.notifyCustomer);

router.post("/push/riders/broadcast", requirePermission("push:send"), validate(broadcastSchema), auditSystemAction({ action: "BROADCAST_PUSH_RIDERS", entity: "PushNotification" }), fcmCtrl.broadcastToRiders);
router.post("/push/riders/batch", requirePermission("push:send"), validate(sendToRiderBatchSchema), auditSystemAction({ action: "SEND_PUSH_RIDER_BATCH", entity: "PushNotification" }), fcmCtrl.notifyRiderBatch);
router.post("/push/riders/:id", requirePermission("push:send"), validate(sendToSingleSchema), auditSystemAction({ action: "SEND_PUSH_RIDER", entity: "PushNotification", getEntityId: (r) => r.params.id }), fcmCtrl.notifyRider);

router.post("/push/vendors/broadcast", requirePermission("push:send"), validate(broadcastSchema), auditSystemAction({ action: "BROADCAST_PUSH_VENDORS", entity: "PushNotification" }), fcmCtrl.broadcastToVendors);
router.post("/push/vendors/batch", requirePermission("push:send"), validate(sendToVendorBatchSchema), auditSystemAction({ action: "SEND_PUSH_VENDOR_BATCH", entity: "PushNotification" }), fcmCtrl.notifyVendorBatch);
router.post("/push/vendors/:id", requirePermission("push:send"), validate(sendToSingleSchema), auditSystemAction({ action: "SEND_PUSH_VENDOR", entity: "PushNotification", getEntityId: (r) => r.params.id }), fcmCtrl.notifyVendor);

// ─── Business Management ────────────────────────────────────────
router.get("/businesses", requirePermission("businesses:read"), businessCtrl.listBusinesses);
router.post(
  "/businesses",
  requirePermission("businesses:write"),
  documentUpload.fields([
    { name: "cacCertificate", maxCount: 1 },
    { name: "driversLicense", maxCount: 1 },
    { name: "insuranceDocument", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
  ]),
  auditSystemAction({ action: "CREATE_BUSINESS", entity: "Business" }),
  businessCtrl.createBusiness
);
router.get("/businesses/:id", requirePermission("businesses:read"), businessCtrl.getBusiness);
router.patch(
  "/businesses/:id",
  requirePermission("businesses:write"),
  auditSystemAction({ action: "UPDATE_BUSINESS", entity: "Business", getEntityId: (r) => r.params.id }),
  businessCtrl.updateBusiness
);
router.post(
  "/businesses/:id/owner",
  requirePermission("businesses:write"),
  auditSystemAction({ action: "CREATE_BUSINESS_OWNER", entity: "Business", getEntityId: (r) => r.params.id }),
  businessCtrl.createBusinessOwner
);
router.post(
  "/businesses/:id/documents/:field",
  requirePermission("businesses:write"),
  documentUpload.single("file"),
  auditSystemAction({ action: "UPLOAD_BUSINESS_DOCUMENT", entity: "Business", getEntityId: (r) => r.params.id }),
  businessCtrl.uploadBusinessDocumentAsAdmin
);
router.get("/businesses/:id/riders", requirePermission("businesses:read"), businessCtrl.listBusinessRidersAsAdmin);
router.get("/businesses/:id/wallet/transactions", requirePermission("businesses:read"), businessCtrl.listBusinessWalletTransactionsAsAdmin);
router.get("/businesses/:id/team", requirePermission("businesses:read"), businessCtrl.listBusinessTeamAsAdmin);

// ─── Heroes ──────────────────────────────────────────────────────
router.get("/heroes", requirePermission("heroes:write"), heroCtrl.listHeroes);
router.post("/heroes", requirePermission("heroes:write"), auditSystemAction({ action: "CREATE_HERO", entity: "Hero" }), heroCtrl.createHero);
router.get("/heroes/:id", requirePermission("heroes:write"), heroCtrl.getHero);
router.patch("/heroes/:id", requirePermission("heroes:write"), auditSystemAction({ action: "UPDATE_HERO", entity: "Hero", getEntityId: (r) => r.params.id }), heroCtrl.updateHero);
router.post("/heroes/:id/image", requirePermission("heroes:write"), upload.single("image"), auditSystemAction({ action: "UPLOAD_HERO_IMAGE", entity: "Hero", getEntityId: (r) => r.params.id }), heroCtrl.uploadHeroImage);
router.delete("/heroes/:id", requirePermission("heroes:write"), auditSystemAction({ action: "DELETE_HERO", entity: "Hero", getEntityId: (r) => r.params.id }), heroCtrl.deleteHero);

// ─── Banners ─────────────────────────────────────────────────────
router.get("/banners", requirePermission("banners:write"), bannerCtrl.listBanners);
router.post("/banners", requirePermission("banners:write"), auditSystemAction({ action: "CREATE_BANNER", entity: "Banner" }), bannerCtrl.createBanner);
router.get("/banners/:id", requirePermission("banners:write"), bannerCtrl.getBanner);
router.patch("/banners/:id", requirePermission("banners:write"), auditSystemAction({ action: "UPDATE_BANNER", entity: "Banner", getEntityId: (r) => r.params.id }), bannerCtrl.updateBanner);
router.post("/banners/:id/image", requirePermission("banners:write"), upload.single("image"), auditSystemAction({ action: "UPLOAD_BANNER_IMAGE", entity: "Banner", getEntityId: (r) => r.params.id }), bannerCtrl.uploadBannerImage);
router.delete("/banners/:id", requirePermission("banners:write"), auditSystemAction({ action: "DELETE_BANNER", entity: "Banner", getEntityId: (r) => r.params.id }), bannerCtrl.deleteBanner);

// ─── Promotions / Coupons ────────────────────────────────────────
router.get("/promotions", requirePermission("coupons:write"), promotionsCtrl.listPromotions);
router.post("/promotions", requirePermission("coupons:write"), auditSystemAction({ action: "CREATE_PROMOTION", entity: "Promotion" }), promotionsCtrl.createPromotion);
router.get("/promotions/:id", requirePermission("coupons:write"), promotionsCtrl.getPromotion);
router.patch("/promotions/:id", requirePermission("coupons:write"), auditSystemAction({ action: "UPDATE_PROMOTION", entity: "Promotion", getEntityId: (r) => r.params.id }), promotionsCtrl.updatePromotion);
router.delete("/promotions/:id", requirePermission("coupons:write"), auditSystemAction({ action: "DELETE_PROMOTION", entity: "Promotion", getEntityId: (r) => r.params.id }), promotionsCtrl.deletePromotion);

export default router;
