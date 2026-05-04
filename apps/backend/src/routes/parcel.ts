import { Router } from "express";
import * as parcelController from "../controllers/parcelController";
import { requireAuth } from "../middleware/auth";
import { requireSystemAuth } from "../middleware/systemAuth";
import { validate } from "../middleware/validate";
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
router.get("/admin/vehicle-types", requireSystemAuth, parcelController.adminListVehicleTypes);
router.post("/vehicle-types", requireSystemAuth, validate(createParcelVehicleTypeSchema), parcelController.createVehicleType);
router.patch("/vehicle-types/:id", requireSystemAuth, validate(updateParcelVehicleTypeSchema), parcelController.updateVehicleType);
router.delete("/vehicle-types/:id", requireSystemAuth, parcelController.deleteVehicleType);

// ─── Customer ─────────────────────────────────────────────────
router.post("/quote", requireAuth, validate(parcelQuoteSchema), parcelController.getQuote);
router.post("/orders", requireAuth, validate(placeParcelOrderSchema), parcelController.placeOrder);

export default router;
