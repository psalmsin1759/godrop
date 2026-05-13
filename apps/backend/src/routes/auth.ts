import { Router } from "express";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import {
  requestOtpSchema,
  verifyOtpSchema,
  registerSchema,
  refreshTokenSchema,
  logoutSchema,
  passwordLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/authValidators";

const router = Router();

router.post("/otp/request", validate(requestOtpSchema), authController.requestOtp);
router.post("/otp/verify", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/register", validate(registerSchema), authController.register);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", validate(logoutSchema), authController.logout);
router.post("/login", validate(passwordLoginSchema), authController.passwordLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.patch("/change-password", requireAuth, validate(changePasswordSchema), authController.changePassword);
router.delete("/account", requireAuth, authController.deleteAccount);

export default router;
