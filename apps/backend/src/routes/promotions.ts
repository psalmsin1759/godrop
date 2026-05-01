import { Router } from "express";
import * as promotionsController from "../controllers/promotionsController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { applyPromoSchema } from "../validators/promotionsValidators";

const router = Router();

router.get("/banners", promotionsController.listBanners);
router.post("/apply", requireAuth, validate(applyPromoSchema), promotionsController.applyPromoCode);

export default router;
