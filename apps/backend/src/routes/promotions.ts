import { Router } from "express";
import * as promotionsController from "../controllers/promotionsController";
import * as bannerController from "../controllers/bannerController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { applyPromoSchema } from "../validators/promotionsValidators";

const router = Router();

router.get("/banners", bannerController.listPublicBanners);
router.post("/apply", requireAuth, validate(applyPromoSchema), promotionsController.applyPromoCode);

export default router;
