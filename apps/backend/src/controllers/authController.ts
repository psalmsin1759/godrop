import { Request, Response, NextFunction } from "express";
import * as otpService from "../services/otpService";
import * as authService from "../services/authService";
import { ok, fail } from "../utils/response";

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.body;
    const result = await otpService.sendOtp(phone);
    ok(res, { message: "OTP sent", expiresIn: result.expiresIn });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = req.body;
    const valid = await otpService.verifyOtp(phone, otp);
    if (!valid) return fail(res, "Invalid or expired OTP", 400);

    const { user, isNewUser } = await authService.findOrCreateUser(phone);
    const tokens = await authService.issueTokens(user);

    ok(res, { ...tokens, isNewUser });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, firstName, lastName, email, referralCode } = req.body;
    const user = await authService.completeRegistration(phone, { firstName, lastName, email, referralCode });
    const tokens = await authService.issueTokens(user);
    ok(res, { user, ...tokens }, 201);
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await authService.rotateRefreshToken(req.body.refreshToken);
    ok(res, tokens);
  } catch (err) {
    fail(res, "Invalid refresh token", 401);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.revokeRefreshToken(req.body.refreshToken);
    ok(res, { message: "Logged out" });
  } catch (err) {
    next(err);
  }
}
