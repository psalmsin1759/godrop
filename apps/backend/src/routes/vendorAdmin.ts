import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireVendorAuth, requirePermission, requireOwner } from "../middleware/vendorAuth";
import { auditVendorAction } from "../middleware/auditLog";
import { catalogImageUpload, upload } from "../middleware/upload";
import {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryActiveSchema,
  createProductSchema,
  updateProductSchema,
  toggleAvailabilitySchema,
  updateVendorSettingsSchema,
  inviteTeamMemberSchema,
  updateTeamMemberSchema,
  changePasswordSchema,
  rejectOrderSchema,
  cancelOrderSchema,
  graphQuerySchema,
  updateVendorAdminProfileSchema,
  updateVendorAdminSettingsSchema,
  pushTokenSchema,
  removePushTokenSchema,
  exportAuditLogsSchema,
  createVendorRoleSchema,
  updateVendorRoleSchema,
} from "../validators/vendorAdminValidators";
import * as ctrl from "../controllers/vendorAdminController";
import * as roleCtrl from "../controllers/roleController";
import * as analyticsCtrl from "../controllers/analyticsController";
import * as disputeCtrl from "../controllers/disputeController";
import {
  createMyDisputeSchema,
  myDisputeQuerySchema,
  addMyMessageSchema,
} from "../validators/disputeValidators";
import { auditLogQuerySchema } from "../validators/systemAdminValidators";

const router = Router();

// ─── Authenticated ────────────────────────────────────────────
router.use(requireVendorAuth);

// Profile
router.get("/me", ctrl.getProfile);
router.delete("/me", requireOwner, ctrl.deleteAccount);
router.post(
  "/me/change-password",
  validate(changePasswordSchema),
  auditVendorAction({ action: "CHANGE_PASSWORD", entity: "VendorAdmin" }),
  ctrl.changePassword
);
router.patch(
  "/me/profile",
  validate(updateVendorAdminProfileSchema),
  auditVendorAction({ action: "UPDATE_PROFILE", entity: "VendorAdmin" }),
  ctrl.updateProfile
);
router.get("/me/settings", ctrl.getProfileSettings);
router.patch("/me/settings", validate(updateVendorAdminSettingsSchema), ctrl.updateProfileSettings);

// ─── Catalog image upload ─────────────────────────────────────
router.post("/catalog/image", requirePermission("catalog:write"), catalogImageUpload.single("file"), ctrl.uploadCatalogImage);

// Categories
router.get("/categories", requirePermission("catalog:read"), ctrl.listCategories);
router.post(
  "/categories",
  requirePermission("catalog:write"),
  validate(createCategorySchema),
  auditVendorAction({ action: "CREATE_CATEGORY", entity: "ProductCategory" }),
  ctrl.createCategory
);
router.get("/categories/:id", requirePermission("catalog:read"), ctrl.getCategory);
router.put(
  "/categories/:id",
  requirePermission("catalog:write"),
  validate(updateCategorySchema),
  auditVendorAction({ action: "UPDATE_CATEGORY", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.updateCategory
);
router.patch(
  "/categories/:id/active",
  requirePermission("catalog:write"),
  validate(toggleCategoryActiveSchema),
  auditVendorAction({ action: "TOGGLE_CATEGORY_ACTIVE", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.toggleCategoryActive
);
router.delete(
  "/categories/:id",
  requirePermission("catalog:write"),
  auditVendorAction({ action: "DELETE_CATEGORY", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.deleteCategory
);

// Products
router.get("/products", requirePermission("catalog:read"), ctrl.listProducts);
router.get("/products/:id", requirePermission("catalog:read"), ctrl.getProduct);
router.post(
  "/products",
  requirePermission("catalog:write"),
  validate(createProductSchema),
  auditVendorAction({ action: "CREATE_PRODUCT", entity: "Product" }),
  ctrl.createProduct
);
router.put(
  "/products/:id",
  requirePermission("catalog:write"),
  validate(updateProductSchema),
  auditVendorAction({ action: "UPDATE_PRODUCT", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.updateProduct
);
router.delete(
  "/products/:id",
  requirePermission("catalog:write"),
  auditVendorAction({ action: "DELETE_PRODUCT", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.deleteProduct
);
router.patch(
  "/products/:id/availability",
  requirePermission("catalog:write"),
  validate(toggleAvailabilitySchema),
  auditVendorAction({ action: "TOGGLE_PRODUCT_AVAILABILITY", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.toggleProductAvailability
);

// Orders
router.get("/orders", requirePermission("orders:read"), ctrl.listOrders);
router.get("/orders/:id", requirePermission("orders:read"), ctrl.getOrder);
router.patch(
  "/orders/:id/accept",
  requirePermission("orders:write"),
  auditVendorAction({ action: "ACCEPT_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.acceptOrder
);
router.patch(
  "/orders/:id/preparing",
  requirePermission("orders:write"),
  auditVendorAction({ action: "MARK_ORDER_PREPARING", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.markOrderPreparing
);
router.patch(
  "/orders/:id/ready",
  requirePermission("orders:write"),
  auditVendorAction({ action: "MARK_ORDER_READY", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.markOrderReady
);
router.patch(
  "/orders/:id/reject",
  requirePermission("orders:write"),
  validate(rejectOrderSchema),
  auditVendorAction({ action: "REJECT_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.rejectOrder
);
router.patch(
  "/orders/:id/cancel",
  requirePermission("orders:write"),
  validate(cancelOrderSchema),
  auditVendorAction({ action: "CANCEL_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.cancelOrder
);

// Disputes (same visibility as orders)
const vendorActor = (req: Parameters<typeof ctrl.getProfile>[0]) => ({
  type: "VENDOR" as const,
  id: req.admin!.vendorId!,
});
router.post("/disputes/upload", requirePermission("disputes:write"), upload.single("file"), disputeCtrl.uploadDisputeEvidence);
router.post(
  "/disputes",
  requirePermission("disputes:write"),
  validate(createMyDisputeSchema),
  disputeCtrl.createMyDispute(vendorActor)
);
router.get(
  "/disputes",
  requirePermission("disputes:read"),
  validate(myDisputeQuerySchema, "query"),
  disputeCtrl.listMyDisputes(vendorActor)
);
router.get(
  "/disputes/unread-count",
  requirePermission("disputes:read"),
  disputeCtrl.getMyDisputesUnreadCount(vendorActor)
);
router.get("/disputes/:id", requirePermission("disputes:read"), disputeCtrl.getMyDispute(vendorActor));
router.post(
  "/disputes/:id/messages",
  requirePermission("disputes:write"),
  validate(addMyMessageSchema),
  disputeCtrl.addMyMessage(vendorActor)
);

// Analytics
router.get("/analytics", requirePermission("analytics:read"), analyticsCtrl.vendorAnalytics);
router.get(
  "/analytics/graph",
  requirePermission("analytics:read"),
  validate(graphQuerySchema, "query"),
  analyticsCtrl.vendorGraphData
);
router.get("/analytics/lifetime", requirePermission("analytics:read"), analyticsCtrl.vendorLifetimeStats);

// Settings
router.get("/settings", requirePermission("settings:read"), ctrl.getSettings);
router.put(
  "/settings",
  requirePermission("settings:write"),
  validate(updateVendorSettingsSchema),
  auditVendorAction({ action: "UPDATE_VENDOR_SETTINGS", entity: "Vendor" }),
  ctrl.updateSettings
);

// Team & Roles
router.get("/team", requirePermission("team:read"), ctrl.listTeam);
router.post(
  "/team",
  requirePermission("team:write"),
  validate(inviteTeamMemberSchema),
  auditVendorAction({ action: "INVITE_TEAM_MEMBER", entity: "VendorAdmin" }),
  ctrl.inviteTeamMember
);
router.patch(
  "/team/:memberId",
  requirePermission("team:write"),
  validate(updateTeamMemberSchema),
  auditVendorAction({ action: "UPDATE_TEAM_MEMBER_ROLE", entity: "VendorAdmin", getEntityId: (r) => r.params.memberId }),
  ctrl.updateTeamMember
);
router.delete(
  "/team/:memberId",
  requirePermission("team:write"),
  auditVendorAction({ action: "REMOVE_TEAM_MEMBER", entity: "VendorAdmin", getEntityId: (r) => r.params.memberId }),
  ctrl.removeTeamMember
);

router.get("/permissions", requirePermission("team:read"), roleCtrl.listVendorPermissions);
router.get("/roles", requirePermission("team:read"), roleCtrl.listRoles);
router.post(
  "/roles",
  requirePermission("team:write"),
  validate(createVendorRoleSchema),
  auditVendorAction({ action: "CREATE_ROLE", entity: "Role" }),
  roleCtrl.createRole
);
router.patch(
  "/roles/:id",
  requirePermission("team:write"),
  validate(updateVendorRoleSchema),
  auditVendorAction({ action: "UPDATE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.updateRole
);
router.delete(
  "/roles/:id",
  requirePermission("team:write"),
  auditVendorAction({ action: "DELETE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.deleteRole
);

// ─── Audit Logs ───────────────────────────────────────────────
router.get(
  "/audit-logs",
  requirePermission("audit_logs:read"),
  validate(auditLogQuerySchema, "query"),
  ctrl.listVendorAuditLogs
);
router.post(
  "/audit-logs/export",
  requirePermission("audit_logs:read"),
  validate(exportAuditLogsSchema),
  ctrl.exportAuditLogs
);

// ─── Notifications (own account) ─────────────────────────────
router.post("/me/push-token", validate(pushTokenSchema), ctrl.registerPushToken);
router.delete("/me/push-token", validate(removePushTokenSchema), ctrl.removePushToken);
router.get("/notifications", ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getNotificationsUnreadCount);
router.patch("/notifications/read-all", ctrl.markAllNotificationsRead);
router.patch("/notifications/:id/read", ctrl.markNotificationRead);

export default router;
