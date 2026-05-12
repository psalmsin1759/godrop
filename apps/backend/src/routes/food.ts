import { Router } from "express";
import * as foodController from "../controllers/foodController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/restaurants", foodController.listRestaurants);
router.get("/restaurants/:id", foodController.getRestaurant);
router.get("/restaurants/:id/menu", foodController.getMenuItems);
router.get("/restaurants/:id/reviews", foodController.getRestaurantReviews);
router.get("/search", foodController.searchFood);
router.post("/checkout", requireAuth, foodController.checkout);

export default router;
