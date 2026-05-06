import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireSystemAuth, requireSystemRole } from "../middleware/systemAuth";
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
} from "../validators/systemAdminValidators";
import * as ctrl from "../controllers/systemAdminController";
import * as analyticsCtrl from "../controllers/analyticsController";
import * as riderCtrl from "../controllers/riderController";
import * as fcmCtrl from "../controllers/fcmController";
import {
  sendToSingleSchema,
  sendToCustomerBatchSchema,
  sendToRiderBatchSchema,
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
router.patch("/me/settings", validate(updateAdminSettingsSchema), ctrl.updateSettings);

router.get("/platform-settings", requireSystemRole("ADMIN"), ctrl.getPlatformSettings);
router.patch("/platform-settings", requireSystemRole("ADMIN"), ctrl.updatePlatformSettings);

// ─── Admin Management (SUPER_ADMIN only) ─────────────────────
router.get(
  "/admins",
  requireSystemRole("SUPER_ADMIN"),
  ctrl.listAdmins
);
router.post(
  "/admins",
  requireSystemRole("SUPER_ADMIN"),
  validate(createSystemAdminSchema),
  auditSystemAction({ action: "CREATE_SYSTEM_ADMIN", entity: "SystemAdmin" }),
  ctrl.createAdmin
);
router.patch(
  "/admins/:id",
  requireSystemRole("SUPER_ADMIN"),
  validate(updateSystemAdminSchema),
  auditSystemAction({ action: "UPDATE_SYSTEM_ADMIN", entity: "SystemAdmin", getEntityId: (r) => r.params.id }),
  ctrl.updateAdmin
);

// ─── Vendor Management (ADMIN+) ───────────────────────────────
router.get("/vendors", requireSystemRole("ADMIN"), ctrl.listVendors);
router.get("/vendors/:id", requireSystemRole("ADMIN"), ctrl.getVendor);
router.patch(
  "/vendors/:id/approve",
  requireSystemRole("ADMIN"),
  auditSystemAction({ action: "APPROVE_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.approveVendor
);
router.patch(
  "/vendors/:id/reject",
  requireSystemRole("ADMIN"),
  validate(rejectVendorSchema),
  auditSystemAction({ action: "REJECT_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.rejectVendor
);
router.patch(
  "/vendors/:id/suspend",
  requireSystemRole("ADMIN"),
  validate(suspendVendorSchema),
  auditSystemAction({ action: "SUSPEND_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.suspendVendor
);
router.patch(
  "/vendors/:id/reinstate",
  requireSystemRole("ADMIN"),
  auditSystemAction({ action: "REINSTATE_VENDOR", entity: "Vendor", getEntityId: (r) => r.params.id }),
  ctrl.reinstateVendor
);

// ─── Customer Management (ADMIN+) ────────────────────────────
router.get(
  "/customers",
  requireSystemRole("ADMIN"),
  validate(customerQuerySchema, "query"),
  ctrl.listCustomers
);
router.get("/customers/:id", requireSystemRole("ADMIN"), ctrl.getCustomer);
router.get(
  "/customers/:id/orders",
  requireSystemRole("ADMIN"),
  validate(customerOrderQuerySchema, "query"),
  ctrl.getCustomerOrders
);
router.patch(
  "/customers/:id/status",
  requireSystemRole("ADMIN"),
  validate(updateCustomerStatusSchema),
  auditSystemAction({ action: "UPDATE_CUSTOMER_STATUS", entity: "User", getEntityId: (r) => r.params.id }),
  ctrl.updateCustomerStatus
);
router.get("/customers/:id/wallet", requireSystemRole("ADMIN"), ctrl.getCustomerWallet);
router.get(
  "/customers/:id/wallet/transactions",
  requireSystemRole("ADMIN"),
  validate(walletTxQuerySchema, "query"),
  ctrl.getCustomerWalletTransactions
);

// ─── Analytics (ADMIN+) ──────────────────────────────────────
router.get("/analytics", requireSystemRole("ADMIN"), analyticsCtrl.systemAnalytics);
router.get(
  "/analytics/graph",
  requireSystemRole("ADMIN"),
  validate(graphQuerySchema, "query"),
  analyticsCtrl.systemGraphData
);

// ─── Audit Logs (ADMIN+) ──────────────────────────────────────
router.get(
  "/audit-logs",
  requireSystemRole("ADMIN"),
  validate(auditLogQuerySchema, "query"),
  ctrl.listAuditLogs
);

// ─── Orders (ADMIN+) ─────────────────────────────────────────
router.get("/orders", requireSystemRole("ADMIN"), ctrl.listOrders);
router.get("/orders/:id", requireSystemRole("ADMIN"), ctrl.getOrder);
router.patch(
  "/orders/:id/status",
  requireSystemRole("ADMIN"),
  validate(adminUpdateOrderStatusSchema),
  auditSystemAction({ action: "UPDATE_ORDER_STATUS", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.updateOrderStatus
);
router.patch(
  "/orders/:id/cancel",
  requireSystemRole("ADMIN"),
  validate(adminCancelOrderSchema),
  auditSystemAction({ action: "CANCEL_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.cancelOrder
);

// ─── Notifications (ADMIN+) ───────────────────────────────────
router.get("/notifications", requireSystemRole("ADMIN"), ctrl.listNotifications);
router.get("/notifications/unread-count", requireSystemRole("ADMIN"), ctrl.getNotificationsUnreadCount);
router.patch("/notifications/read-all", requireSystemRole("ADMIN"), ctrl.markAllNotificationsRead);
router.patch("/notifications/:id/read", requireSystemRole("ADMIN"), ctrl.markNotificationRead);

// ─── Riders (ADMIN+) ─────────────────────────────────────────
router.get("/riders/stats", requireSystemRole("ADMIN"), riderCtrl.getRiderStats);
router.get("/riders/available", requireSystemRole("ADMIN"), riderCtrl.listAvailableRiders);
router.get("/riders", requireSystemRole("ADMIN"), validate(riderQuerySchema, "query"), riderCtrl.listRiders);
router.post("/riders", requireSystemRole("ADMIN"), validate(createRiderSchema), riderCtrl.createRider);
router.get("/riders/:id", requireSystemRole("ADMIN"), riderCtrl.getRider);
router.patch("/riders/:id", requireSystemRole("ADMIN"), validate(updateRiderSchema), riderCtrl.updateRider);
router.patch("/riders/:id/kyc", requireSystemRole("ADMIN"), validate(updateRiderKycSchema), riderCtrl.updateRiderKyc);
router.patch("/riders/:id/toggle-active", requireSystemRole("ADMIN"), riderCtrl.toggleRiderActive);
router.post(
  "/riders/:id/assign-order",
  requireSystemRole("ADMIN"),
  validate(assignOrderSchema),
  auditSystemAction({ action: "ASSIGN_ORDER_TO_RIDER", entity: "Order", getEntityId: (r) => r.body.orderId }),
  riderCtrl.assignOrderToRider
);
router.get(
  "/riders/:id/orders",
  requireSystemRole("ADMIN"),
  validate(riderOrderQuerySchema, "query"),
  riderCtrl.getRiderOrders
);
router.get("/riders/:id/earnings", requireSystemRole("ADMIN"), riderCtrl.getRiderEarnings);
router.patch(
  "/riders/:id/withdrawals/:withdrawalId",
  requireSystemRole("ADMIN"),
  validate(processWithdrawalSchema),
  auditSystemAction({ action: "PROCESS_RIDER_WITHDRAWAL", entity: "RiderWithdrawal", getEntityId: (r) => r.params.withdrawalId }),
  riderCtrl.processWithdrawal
);

// ─── Push Notifications (ADMIN+) ─────────────────────────────
router.post("/push/customers/broadcast", requireSystemRole("ADMIN"), validate(broadcastSchema), fcmCtrl.broadcastToCustomers);
router.post("/push/customers/batch", requireSystemRole("ADMIN"), validate(sendToCustomerBatchSchema), fcmCtrl.notifyCustomerBatch);
router.post("/push/customers/:id", requireSystemRole("ADMIN"), validate(sendToSingleSchema), fcmCtrl.notifyCustomer);

router.post("/push/riders/broadcast", requireSystemRole("ADMIN"), validate(broadcastSchema), fcmCtrl.broadcastToRiders);
router.post("/push/riders/batch", requireSystemRole("ADMIN"), validate(sendToRiderBatchSchema), fcmCtrl.notifyRiderBatch);
router.post("/push/riders/:id", requireSystemRole("ADMIN"), validate(sendToSingleSchema), fcmCtrl.notifyRider);

export default router;
