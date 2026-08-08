import { Router } from "express";
import * as truckController from "../controllers/truckController";
import { requireAuth } from "../middleware/auth";
import { requireSystemAuth, requirePermission } from "../middleware/systemAuth";
import { validate } from "../middleware/validate";
import { catalogImageUpload } from "../middleware/upload";
import {
  truckQuoteSchema,
  bookTruckSchema,
  createApartmentTypeSchema,
  updateApartmentTypeSchema,
  setPerKmSchema,
  setPerLoaderSchema,
  createTruckTypeSchema,
  updateTruckTypeSchema,
} from "../validators/truckValidators";

const router = Router();

// ─── Pricing summary (public) ─────────────────────────────────
router.get("/pricing", truckController.getPricingSummary);

// ─── Apartment types (public) ─────────────────────────────────
router.get("/apartment-types", truckController.listApartmentTypes);

// ─── Apartment types (admin) ──────────────────────────────────
router.get("/admin/apartment-types", requireSystemAuth, requirePermission("trucks:read"), truckController.adminListApartmentTypes);
router.post("/apartment-types", requireSystemAuth, requirePermission("trucks:write"), validate(createApartmentTypeSchema), truckController.createApartmentType);
router.patch("/apartment-types/:id", requireSystemAuth, requirePermission("trucks:write"), validate(updateApartmentTypeSchema), truckController.updateApartmentType);
router.delete("/apartment-types/:id", requireSystemAuth, requirePermission("trucks:write"), truckController.deleteApartmentType);

// ─── Pricing config (admin) ───────────────────────────────────
router.put("/pricing/per-km", requireSystemAuth, requirePermission("trucks:write"), validate(setPerKmSchema), truckController.setPerKmCost);
router.put("/pricing/per-loader", requireSystemAuth, requirePermission("trucks:write"), validate(setPerLoaderSchema), truckController.setPerLoaderCost);

// ─── Customer ─────────────────────────────────────────────────
router.post("/quote", requireAuth, validate(truckQuoteSchema), truckController.getQuote);
router.post("/orders", requireAuth, validate(bookTruckSchema), truckController.bookTruck);

// ─── Truck vehicle types — legacy CRUD ────────────────────────
router.get("/types", truckController.listTruckTypes);
router.post("/types/image", requireSystemAuth, requirePermission("trucks:write"), catalogImageUpload.single("file"), truckController.uploadTruckTypeImage);
router.post("/types", requireSystemAuth, requirePermission("trucks:write"), validate(createTruckTypeSchema), truckController.createTruckType);
router.patch("/types/:id", requireSystemAuth, requirePermission("trucks:write"), validate(updateTruckTypeSchema), truckController.updateTruckType);
router.delete("/types/:id", requireSystemAuth, requirePermission("trucks:write"), truckController.deleteTruckType);

export default router;
