import { Router } from "express";
import { requireBusinessAuth, requirePermission } from "../middleware/businessAuth";
import { validate } from "../middleware/validate";
import { auditBusinessAction } from "../middleware/auditLog";
import { documentUpload } from "../middleware/upload";
import * as ctrl from "../controllers/businessAdminController";
import * as roleCtrl from "../controllers/roleController";
import {
  createBusinessRoleSchema,
  updateBusinessRoleSchema,
} from "../validators/businessAdminValidators";

const router = Router();

router.use(requireBusinessAuth);

// ─── Me ───────────────────────────────────────────────────────
router.get("/me", ctrl.getMe);
router.get("/business", ctrl.getMyBusiness);
router.patch(
  "/business",
  requirePermission("business:write"),
  auditBusinessAction({ action: "UPDATE_BUSINESS_PROFILE", entity: "Business" }),
  ctrl.updateMyBusiness
);
router.post(
  "/business/documents/:field",
  requirePermission("business:write"),
  documentUpload.single("file"),
  auditBusinessAction({ action: "UPLOAD_BUSINESS_DOCUMENT", entity: "Business" }),
  ctrl.uploadMyDocument
);

// ─── Riders ───────────────────────────────────────────────────
router.get("/riders", requirePermission("riders:read"), ctrl.listRiders);
router.post(
  "/riders/:riderId/assign",
  requirePermission("riders:write"),
  auditBusinessAction({ action: "ASSIGN_RIDER", entity: "Rider", getEntityId: (r) => r.params.riderId }),
  ctrl.assignRider
);
router.delete(
  "/riders/:riderId",
  requirePermission("riders:write"),
  auditBusinessAction({ action: "REMOVE_RIDER", entity: "Rider", getEntityId: (r) => r.params.riderId }),
  ctrl.removeRider
);
router.get("/riders/:riderId/orders", requirePermission("riders:read"), ctrl.getRiderOrders);

// ─── Wallet ───────────────────────────────────────────────────
router.get("/wallet", requirePermission("wallet:read"), ctrl.getWallet);
router.get("/wallet/transactions", requirePermission("wallet:read"), ctrl.listWalletTransactions);

// ─── Team & Roles ───────────────────────────────────────────────
router.get("/team", requirePermission("team:read"), ctrl.listTeam);
router.post(
  "/team",
  requirePermission("team:write"),
  auditBusinessAction({ action: "CREATE_TEAM_MEMBER", entity: "BusinessAdmin" }),
  ctrl.createTeamMember
);
router.patch(
  "/team/:memberId",
  requirePermission("team:write"),
  auditBusinessAction({ action: "UPDATE_TEAM_MEMBER", entity: "BusinessAdmin", getEntityId: (r) => r.params.memberId }),
  ctrl.updateTeamMember
);

router.get("/permissions", requirePermission("team:read"), roleCtrl.listBusinessPermissions);
router.get("/roles", requirePermission("team:read"), roleCtrl.listRoles);
router.post(
  "/roles",
  requirePermission("team:write"),
  validate(createBusinessRoleSchema),
  auditBusinessAction({ action: "CREATE_ROLE", entity: "Role" }),
  roleCtrl.createRole
);
router.patch(
  "/roles/:id",
  requirePermission("team:write"),
  validate(updateBusinessRoleSchema),
  auditBusinessAction({ action: "UPDATE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.updateRole
);
router.delete(
  "/roles/:id",
  requirePermission("team:write"),
  auditBusinessAction({ action: "DELETE_ROLE", entity: "Role", getEntityId: (r) => r.params.id }),
  roleCtrl.deleteRole
);

export default router;
