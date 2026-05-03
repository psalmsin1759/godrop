import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireVendorAuth, requireVendorRole } from "../middleware/vendorAuth";
import { auditVendorAction } from "../middleware/auditLog";
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
  graphQuerySchema,
  updateVendorAdminProfileSchema,
  updateVendorAdminSettingsSchema,
} from "../validators/vendorAdminValidators";
import * as ctrl from "../controllers/vendorAdminController";
import * as analyticsCtrl from "../controllers/analyticsController";

const router = Router();

// ─── Authenticated ────────────────────────────────────────────
router.use(requireVendorAuth);

// Profile
router.get("/me", ctrl.getProfile);
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

// Categories (MANAGER+)
router.get("/categories", requireVendorRole("MANAGER"), ctrl.listCategories);
router.post(
  "/categories",
  requireVendorRole("MANAGER"),
  validate(createCategorySchema),
  auditVendorAction({ action: "CREATE_CATEGORY", entity: "ProductCategory" }),
  ctrl.createCategory
);
router.get("/categories/:id", requireVendorRole("MANAGER"), ctrl.getCategory);
router.put(
  "/categories/:id",
  requireVendorRole("MANAGER"),
  validate(updateCategorySchema),
  auditVendorAction({ action: "UPDATE_CATEGORY", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.updateCategory
);
router.patch(
  "/categories/:id/active",
  requireVendorRole("MANAGER"),
  validate(toggleCategoryActiveSchema),
  auditVendorAction({ action: "TOGGLE_CATEGORY_ACTIVE", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.toggleCategoryActive
);
router.delete(
  "/categories/:id",
  requireVendorRole("MANAGER"),
  auditVendorAction({ action: "DELETE_CATEGORY", entity: "ProductCategory", getEntityId: (r) => r.params.id }),
  ctrl.deleteCategory
);

// Products (MANAGER+)
router.get("/products", requireVendorRole("MANAGER"), ctrl.listProducts);
router.get("/products/:id", requireVendorRole("MANAGER"), ctrl.getProduct);
router.post(
  "/products",
  requireVendorRole("MANAGER"),
  validate(createProductSchema),
  auditVendorAction({ action: "CREATE_PRODUCT", entity: "Product" }),
  ctrl.createProduct
);
router.put(
  "/products/:id",
  requireVendorRole("MANAGER"),
  validate(updateProductSchema),
  auditVendorAction({ action: "UPDATE_PRODUCT", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.updateProduct
);
router.delete(
  "/products/:id",
  requireVendorRole("MANAGER"),
  auditVendorAction({ action: "DELETE_PRODUCT", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.deleteProduct
);
router.patch(
  "/products/:id/availability",
  requireVendorRole("MANAGER"),
  validate(toggleAvailabilitySchema),
  auditVendorAction({ action: "TOGGLE_PRODUCT_AVAILABILITY", entity: "Product", getEntityId: (r) => r.params.id }),
  ctrl.toggleProductAvailability
);

// Orders (STAFF+)
router.get("/orders", requireVendorRole("STAFF"), ctrl.listOrders);
router.get("/orders/:id", requireVendorRole("STAFF"), ctrl.getOrder);
router.patch(
  "/orders/:id/accept",
  requireVendorRole("STAFF"),
  auditVendorAction({ action: "ACCEPT_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.acceptOrder
);
router.patch(
  "/orders/:id/preparing",
  requireVendorRole("STAFF"),
  auditVendorAction({ action: "MARK_ORDER_PREPARING", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.markOrderPreparing
);
router.patch(
  "/orders/:id/ready",
  requireVendorRole("STAFF"),
  auditVendorAction({ action: "MARK_ORDER_READY", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.markOrderReady
);
router.patch(
  "/orders/:id/reject",
  requireVendorRole("STAFF"),
  validate(rejectOrderSchema),
  auditVendorAction({ action: "REJECT_ORDER", entity: "Order", getEntityId: (r) => r.params.id }),
  ctrl.rejectOrder
);

// Analytics (MANAGER+)
router.get("/analytics", requireVendorRole("MANAGER"), analyticsCtrl.vendorAnalytics);
router.get(
  "/analytics/graph",
  requireVendorRole("MANAGER"),
  validate(graphQuerySchema, "query"),
  analyticsCtrl.vendorGraphData
);

// Settings (view: MANAGER+, update: OWNER)
router.get("/settings", requireVendorRole("MANAGER"), ctrl.getSettings);
router.put(
  "/settings",
  requireVendorRole("OWNER"),
  validate(updateVendorSettingsSchema),
  auditVendorAction({ action: "UPDATE_VENDOR_SETTINGS", entity: "Vendor" }),
  ctrl.updateSettings
);

// Team (view: MANAGER+, manage: OWNER)
router.get("/team", requireVendorRole("MANAGER"), ctrl.listTeam);
router.post(
  "/team",
  requireVendorRole("OWNER"),
  validate(inviteTeamMemberSchema),
  auditVendorAction({ action: "INVITE_TEAM_MEMBER", entity: "VendorAdmin" }),
  ctrl.inviteTeamMember
);
router.patch(
  "/team/:memberId",
  requireVendorRole("OWNER"),
  validate(updateTeamMemberSchema),
  auditVendorAction({ action: "UPDATE_TEAM_MEMBER_ROLE", entity: "VendorAdmin", getEntityId: (r) => r.params.memberId }),
  ctrl.updateTeamMember
);
router.delete(
  "/team/:memberId",
  requireVendorRole("OWNER"),
  auditVendorAction({ action: "REMOVE_TEAM_MEMBER", entity: "VendorAdmin", getEntityId: (r) => r.params.memberId }),
  ctrl.removeTeamMember
);

// ─── Notifications ────────────────────────────────────────────
router.get("/notifications", ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getNotificationsUnreadCount);
router.patch("/notifications/read-all", ctrl.markAllNotificationsRead);
router.patch("/notifications/:id/read", ctrl.markNotificationRead);

export default router;
