import { Router } from "express";
import * as paymentsController from "../controllers/paymentsController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { initPaymentSchema, verifyPaymentSchema } from "../validators/paymentsValidators";

const router = Router();

router.use(requireAuth);

router.post("/initialize", validate(initPaymentSchema), paymentsController.initializePayment);
router.post("/verify", validate(verifyPaymentSchema), paymentsController.verifyPayment);

export default router;
