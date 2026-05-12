import { Router } from "express";
import * as retailController from "../controllers/retailController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validators/retailValidators";

const router = Router();

router.get("/stores", retailController.listStores);
router.get("/stores/:id", retailController.getStore);
router.get("/stores/:id/products", retailController.getProducts);
router.get("/categories", retailController.listCategories);
router.get("/search", retailController.searchRetail);
router.post("/checkout", requireAuth, validate(checkoutSchema), retailController.checkout);

export default router;
