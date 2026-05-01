import { Router } from "express";
import { validate } from "../middleware/validate";
import { onboardVendorSchema } from "../validators/vendorOnboardingValidators";
import { onboard } from "../controllers/vendorOnboardingController";

const router = Router();

router.post("/", validate(onboardVendorSchema), onboard);

export default router;
