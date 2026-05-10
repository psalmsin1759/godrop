import { Router } from "express";
import { validate } from "../middleware/validate";
import { documentUpload } from "../middleware/upload";
import { onboardVendorSchema } from "../validators/vendorOnboardingValidators";
import { onboard } from "../controllers/vendorOnboardingController";

const router = Router();

router.post(
  "/",
  documentUpload.fields([
    { name: "businessRegistration", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
  ]),
  validate(onboardVendorSchema),
  onboard
);

export default router;
