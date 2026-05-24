import { Router } from "express";
import { requireBusinessAuth, requireBusinessOwner } from "../middleware/businessAuth";
import { documentUpload } from "../middleware/upload";
import * as ctrl from "../controllers/businessAdminController";

const router = Router();

router.use(requireBusinessAuth);

// ─── Me ───────────────────────────────────────────────────────
router.get("/me", ctrl.getMe);
router.get("/business", ctrl.getMyBusiness);
router.patch("/business", requireBusinessOwner, ctrl.updateMyBusiness);
router.post("/business/documents/:field", requireBusinessOwner, documentUpload.single("file"), ctrl.uploadMyDocument);

// ─── Riders ───────────────────────────────────────────────────
router.get("/riders", ctrl.listRiders);
router.post("/riders/:riderId/assign", requireBusinessOwner, ctrl.assignRider);
router.delete("/riders/:riderId", requireBusinessOwner, ctrl.removeRider);
router.get("/riders/:riderId/orders", ctrl.getRiderOrders);

// ─── Wallet ───────────────────────────────────────────────────
router.get("/wallet", ctrl.getWallet);
router.get("/wallet/transactions", ctrl.listWalletTransactions);

// ─── Team ─────────────────────────────────────────────────────
router.get("/team", ctrl.listTeam);
router.post("/team", requireBusinessOwner, ctrl.createTeamMember);
router.patch("/team/:memberId", requireBusinessOwner, ctrl.updateTeamMember);

export default router;
