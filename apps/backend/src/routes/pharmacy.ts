import { Router } from "express";
import * as pharmacyController from "../controllers/pharmacyController";

const router = Router();

router.get("/stores", pharmacyController.listPharmacies);
router.get("/stores/:id", pharmacyController.getPharmacy);
router.get("/stores/:id/products", pharmacyController.getProducts);
router.get("/search", pharmacyController.searchPharmacy);

export default router;
