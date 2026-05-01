import { Router } from "express";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/validate";
import {
  requestOtpSchema,
  verifyOtpSchema,
  registerSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validators/authValidators";

const router = Router();

router.post("/otp/request", validate(requestOtpSchema), authController.requestOtp);
router.post("/otp/verify", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/register", validate(registerSchema), authController.register);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", validate(logoutSchema), authController.logout);

export default router;
