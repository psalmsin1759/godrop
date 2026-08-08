import { Router } from "express";
import * as parcelController from "../controllers/parcelController";
import { requireAuth } from "../middleware/auth";
import { requireSystemAuth, requirePermission } from "../middleware/systemAuth";
import { validate } from "../middleware/validate";
import { catalogImageUpload } from "../middleware/upload";
import {
  parcelQuoteSchema,
  placeParcelOrderSchema,
  createParcelVehicleTypeSchema,
  updateParcelVehicleTypeSchema,
} from "../validators/parcelValidators";

const router = Router();

// ─── Vehicle types (public) ───────────────────────────────────
router.get("/vehicle-types", parcelController.listVehicleTypes);
router.get("/vehicle-types/:id", parcelController.getVehicleType);

// ─── Vehicle types (admin) ────────────────────────────────────
router.get("/admin/vehicle-types", requireSystemAuth, requirePermission("parcels:read"), parcelController.adminListVehicleTypes);
router.post("/vehicle-types/image", requireSystemAuth, requirePermission("parcels:write"), catalogImageUpload.single("file"), parcelController.uploadVehicleTypeImage);
router.post("/vehicle-types", requireSystemAuth, requirePermission("parcels:write"), validate(createParcelVehicleTypeSchema), parcelController.createVehicleType);
router.patch("/vehicle-types/:id", requireSystemAuth, requirePermission("parcels:write"), validate(updateParcelVehicleTypeSchema), parcelController.updateVehicleType);
router.delete("/vehicle-types/:id", requireSystemAuth, requirePermission("parcels:write"), parcelController.deleteVehicleType);

// ─── Customer ─────────────────────────────────────────────────
router.post("/quote", requireAuth, validate(parcelQuoteSchema), parcelController.getQuote);
router.post("/orders", requireAuth, validate(placeParcelOrderSchema), parcelController.placeOrder);

export default router;
