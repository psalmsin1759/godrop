import { Router } from "express";
import * as foodController from "../controllers/foodController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { checkoutSchema } from "../validators/foodValidators";

const router = Router();

router.get("/restaurants", foodController.listRestaurants);
router.get("/restaurants/:id", foodController.getRestaurant);
router.get("/restaurants/:id/menu", foodController.getMenuItems);
router.get("/restaurants/:id/reviews", foodController.getRestaurantReviews);
router.get("/search", foodController.searchFood);
router.post("/checkout", requireAuth, validate(checkoutSchema), foodController.checkout);

export default router;
