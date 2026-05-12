import { Router } from "express";
import * as groceryController from "../controllers/groceryController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validators/groceryValidators";

const router = Router();

router.get("/stores", groceryController.listStores);
router.get("/stores/:id", groceryController.getStore);
router.get("/stores/:id/products", groceryController.getProducts);
router.get("/search", groceryController.searchGrocery);
router.post("/checkout", requireAuth, validate(checkoutSchema), groceryController.checkout);

export default router;
