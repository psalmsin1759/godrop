import { Router } from "express";
import * as parcelController from "../controllers/parcelController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { parcelQuoteSchema, placeParcelOrderSchema } from "../validators/parcelValidators";

const router = Router();

router.post("/quote", requireAuth, validate(parcelQuoteSchema), parcelController.getQuote);
router.post("/orders", requireAuth, validate(placeParcelOrderSchema), parcelController.placeOrder);

export default router;
