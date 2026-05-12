import { Router } from "express";
import * as pharmacyController from "../controllers/pharmacyController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validators/pharmacyValidators";

const router = Router();

router.get("/stores", pharmacyController.listPharmacies);
router.get("/stores/:id", pharmacyController.getPharmacy);
router.get("/stores/:id/products", pharmacyController.getProducts);
router.get("/search", pharmacyController.searchPharmacy);
router.post("/checkout", requireAuth, validate(checkoutSchema), pharmacyController.checkout);

export default router;
