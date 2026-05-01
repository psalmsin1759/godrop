import { Router } from "express";
import * as ordersController from "../controllers/ordersController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { cancelOrderSchema, rateOrderSchema } from "../validators/ordersValidators";

const router = Router();

router.use(requireAuth);

router.get("/", ordersController.listOrders);
router.get("/:id", ordersController.getOrder);
router.post("/:id/cancel", validate(cancelOrderSchema), ordersController.cancelOrder);
router.post("/:id/rating", validate(rateOrderSchema), ordersController.rateOrder);
router.post("/:id/reorder", ordersController.reorder);
router.get("/:id/tracking", ordersController.getTracking);

export default router;
