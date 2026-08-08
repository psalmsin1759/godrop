import { Router } from "express";
import * as truckController from "../controllers/truckController";
import { requireAuth } from "../middleware/auth";
import { requireSystemAuth, requirePermission } from "../middleware/systemAuth";
import { auditSystemAction } from "../middleware/auditLog";
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
router.post("/apartment-types", requireSystemAuth, requirePermission("trucks:write"), validate(createApartmentTypeSchema), auditSystemAction({ action: "CREATE_APARTMENT_TYPE", entity: "ApartmentType" }), truckController.createApartmentType);
router.patch("/apartment-types/:id", requireSystemAuth, requirePermission("trucks:write"), validate(updateApartmentTypeSchema), auditSystemAction({ action: "UPDATE_APARTMENT_TYPE", entity: "ApartmentType", getEntityId: (r) => r.params.id }), truckController.updateApartmentType);
router.delete("/apartment-types/:id", requireSystemAuth, requirePermission("trucks:write"), auditSystemAction({ action: "DELETE_APARTMENT_TYPE", entity: "ApartmentType", getEntityId: (r) => r.params.id }), truckController.deleteApartmentType);

// ─── Pricing config (admin) ───────────────────────────────────
router.put("/pricing/per-km", requireSystemAuth, requirePermission("trucks:write"), validate(setPerKmSchema), auditSystemAction({ action: "SET_TRUCK_PER_KM_COST", entity: "TruckPricing" }), truckController.setPerKmCost);
router.put("/pricing/per-loader", requireSystemAuth, requirePermission("trucks:write"), validate(setPerLoaderSchema), auditSystemAction({ action: "SET_TRUCK_PER_LOADER_COST", entity: "TruckPricing" }), truckController.setPerLoaderCost);

// ─── Customer ─────────────────────────────────────────────────
router.post("/quote", requireAuth, validate(truckQuoteSchema), truckController.getQuote);
router.post("/orders", requireAuth, validate(bookTruckSchema), truckController.bookTruck);

// ─── Truck vehicle types — legacy CRUD ────────────────────────
router.get("/types", truckController.listTruckTypes);
router.post("/types/image", requireSystemAuth, requirePermission("trucks:write"), catalogImageUpload.single("file"), auditSystemAction({ action: "UPLOAD_TRUCK_TYPE_IMAGE", entity: "TruckType" }), truckController.uploadTruckTypeImage);
router.post("/types", requireSystemAuth, requirePermission("trucks:write"), validate(createTruckTypeSchema), auditSystemAction({ action: "CREATE_TRUCK_TYPE", entity: "TruckType" }), truckController.createTruckType);
router.patch("/types/:id", requireSystemAuth, requirePermission("trucks:write"), validate(updateTruckTypeSchema), auditSystemAction({ action: "UPDATE_TRUCK_TYPE", entity: "TruckType", getEntityId: (r) => r.params.id }), truckController.updateTruckType);
router.delete("/types/:id", requireSystemAuth, requirePermission("trucks:write"), auditSystemAction({ action: "DELETE_TRUCK_TYPE", entity: "TruckType", getEntityId: (r) => r.params.id }), truckController.deleteTruckType);

export default router;
