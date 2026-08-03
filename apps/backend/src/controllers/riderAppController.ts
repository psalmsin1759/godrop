import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";
import * as otpService from "../services/otpService";
import * as riderAuthService from "../services/riderAuthService";
import * as riderAppService from "../services/riderAppService";
import * as riderOrderService from "../services/riderOrderService";
import * as riderEarningService from "../services/riderEarningService";
import * as paystackService from "../services/paystackService";
import { uploadDocument } from "../services/cloudinaryService";
import { submitKycBodySchema } from "../validators/riderAppValidators";
import { onboardRiderSchema } from "../validators/riderOnboardingValidators";
import { sendEmail, riderOnboardAdminEmail, riderOnboardConfirmationEmail } from "../services/emailService";
import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { toNaira, serializeMoney, serializeMoneyList } from "../utils/currency";

// ─── Onboarding (public) ──────────────────────────────────────

export async function onboardRider(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = onboardRiderSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);

    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>;

    if (!files.avatar?.[0]) return fail(res, "A profile photo (avatar) is required for rider onboarding", 400);

    let guarantors: any[] = [];
    if (req.body.guarantors) {
      try {
        guarantors = JSON.parse(req.body.guarantors);
        if (!Array.isArray(guarantors)) return fail(res, "guarantors must be a JSON array", 400);
      } catch {
        return fail(res, "Invalid guarantors JSON", 400);
      }
    }

    const avatarUrl = await uploadDocument(files.avatar[0].buffer, "godrop/rider-avatars");

    const vehiclePaperUrls: string[] = [];
    for (const file of files.vehiclePapers ?? []) {
      const url = await uploadDocument(file.buffer, "godrop/rider-docs/vehicle-papers");
      vehiclePaperUrls.push(url);
    }

    let governmentIdUrl: string | undefined;
    if (files.governmentId?.[0]) {
      governmentIdUrl = await uploadDocument(files.governmentId[0].buffer, "godrop/rider-docs/government-id");
    }

    if (files.guarantorGovernmentId?.[0] && guarantors.length > 0) {
      const url = await uploadDocument(files.guarantorGovernmentId[0].buffer, "godrop/rider-docs/guarantor-id");
      guarantors[0].governmentIdUrl = url;
    }

    const documents: riderAppService.RiderDocuments = {};
    if (governmentIdUrl) documents.governmentIdUrl = governmentIdUrl;
    if (vehiclePaperUrls.length > 0) documents.vehiclePaperUrls = vehiclePaperUrls;

    const rider = await riderAppService.onboardRider(parsed.data, guarantors, documents, avatarUrl);

    // Fire emails in background — don't block the response on SMTP
    const emailJobs = [
      sendEmail(riderOnboardAdminEmail({
        firstName: rider.firstName,
        lastName: rider.lastName,
        phone: rider.phone,
        email: rider.email,
        vehicleType: rider.vehicleType ?? parsed.data.vehicleType,
        city: rider.city,
        state: rider.state,
      })),
    ];
    if (rider.email) {
      emailJobs.push(sendEmail(riderOnboardConfirmationEmail({
        firstName: rider.firstName,
        email: rider.email,
        phone: rider.phone,
        vehicleType: rider.vehicleType ?? parsed.data.vehicleType,
      })));
    }
    Promise.allSettled(emailJobs).catch(() => {/* best-effort */});

    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}

// ─── Auth ──────────────────────────────────────────────────────

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.body;
    const rider = await prisma.rider.findUnique({ where: { phone } });
    if (!rider) return fail(res, "No rider account found for this phone number", 404);
    if (!rider.isActive) return fail(res, "Account is inactive. Contact support.", 403);
    if (rider.passwordHash) {
      return fail(res, "This account is already activated. Please log in with your phone or email and password.", 400);
    }
    const result = await otpService.sendOtp(phone);
    return ok(res, { message: "OTP sent", expiresIn: result.expiresIn });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = req.body;
    const valid = await otpService.verifyOtp(phone, otp);
    if (!valid) return fail(res, "Invalid or expired OTP", 400);

    const rider = await prisma.rider.findUnique({ where: { phone } });
    if (!rider) return fail(res, "Rider not found", 404);
    if (!rider.isActive) return fail(res, "Account is inactive. Contact support.", 403);

    if (!rider.passwordHash) {
      return ok(res, { requiresPasswordSetup: true, riderId: rider.id });
    }

    const tokens = await riderAuthService.issueTokens(rider);
    return ok(res, { ...tokens, rider });
  } catch (err) {
    next(err);
  }
}

export async function passwordLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;
    const rider = await riderAuthService.loginWithPassword(identifier, password);
    if (!rider) return fail(res, "Invalid credentials", 401);
    const tokens = await riderAuthService.issueTokens(rider);
    return ok(res, { ...tokens, rider });
  } catch (err) {
    next(err);
  }
}

export async function setPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { riderId, password } = req.body;
    const rider = await riderAuthService.setInitialPassword(riderId, password);
    if (!rider) return fail(res, "Unable to set password for this account", 400);
    const tokens = await riderAuthService.issueTokens(rider);
    return ok(res, { ...tokens, rider });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    await riderAuthService.sendPasswordReset(email);
    ok(res, { message: "A password reset link has been sent to your email address." });
  } catch (err: any) {
    if (err.message === "EMAIL_NOT_FOUND") {
      return fail(res, "No Godrop Rider account was found with that email address", 404);
    }
    if (err.message === "EMAIL_SEND_FAILED") {
      return fail(res, "We couldn't send the reset email right now. Please try again shortly.", 502);
    }
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    const success = await riderAuthService.resetPassword(token, password);
    if (!success) return fail(res, "Invalid or expired reset token", 400);
    ok(res, { message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await riderAuthService.rotateRefreshToken(req.body.refreshToken);
    return ok(res, tokens);
  } catch {
    return fail(res, "Invalid refresh token", 401);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAuthService.revokeRefreshToken(req.body.refreshToken);
    return ok(res, { message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

// ─── Profile ───────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await riderAppService.getRiderProfile(req.rider!.id);
    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAuthService.deactivateAccount(req.rider!.id);
    return ok(res, { message: "Account deleted" });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await riderAppService.updateRiderProfile(req.rider!.id, req.body);
    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function updateAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await riderAppService.updateAvatarUrl(req.rider!.id, req.body.avatarUrl);
    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function submitKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = submitKycBodySchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);

    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>;

    // Parse guarantors from JSON string in form body
    let guarantors: any[] = [];
    if (req.body.guarantors) {
      try {
        guarantors = JSON.parse(req.body.guarantors);
        if (!Array.isArray(guarantors)) return fail(res, "guarantors must be a JSON array", 400);
      } catch {
        return fail(res, "Invalid guarantors JSON", 400);
      }
    }

    // Upload vehicle papers (multiple)
    const vehiclePaperUrls: string[] = [];
    for (const file of files.vehiclePapers ?? []) {
      const url = await uploadDocument(file.buffer, "godrop/rider-docs/vehicle-papers");
      vehiclePaperUrls.push(url);
    }

    // Upload government ID
    let governmentIdUrl: string | undefined;
    if (files.governmentId?.[0]) {
      governmentIdUrl = await uploadDocument(files.governmentId[0].buffer, "godrop/rider-docs/government-id");
    }

    // Upload guarantor government ID and attach to first guarantor
    if (files.guarantorGovernmentId?.[0] && guarantors.length > 0) {
      const url = await uploadDocument(files.guarantorGovernmentId[0].buffer, "godrop/rider-docs/guarantor-id");
      guarantors[0].governmentIdUrl = url;
    }

    const documents: riderAppService.RiderDocuments = {};
    if (governmentIdUrl) documents.governmentIdUrl = governmentIdUrl;
    if (vehiclePaperUrls.length > 0) documents.vehiclePaperUrls = vehiclePaperUrls;

    const rider = await riderAppService.submitKyc(req.rider!.id, {
      ...parsed.data,
      guarantors: guarantors.length > 0 ? guarantors : undefined,
      documents: Object.keys(documents).length > 0 ? documents : undefined,
    });

    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function updateBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await riderAppService.updateBankAccount(req.rider!.id, req.body);
    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function getBanks(_req: Request, res: Response, next: NextFunction) {
  try {
    const banks = await paystackService.listBanks();
    return ok(res, { banks });
  } catch (err) {
    next(err);
  }
}

export async function resolveAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { accountNumber, bankCode } = req.body;
    const result = await paystackService.resolveAccountNumber({ accountNumber, bankCode });
    return ok(res, result);
  } catch (err: any) {
    if (err?.response?.status === 422 || err?.response?.data?.message?.toLowerCase().includes("account")) {
      return fail(res, "Could not verify account number. Please check the details.", 422);
    }
    next(err);
  }
}

export async function setAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await riderAppService.setAvailability(req.rider!.id, req.body.isAvailable);
    return ok(res, { data: rider });
  } catch (err) {
    next(err);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAppService.updateLocation(req.rider!.id, req.body.lat, req.body.lng);
    return ok(res, { message: "Location updated" });
  } catch (err) {
    next(err);
  }
}

export async function registerPushToken(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAppService.registerPushToken(req.rider!.id, req.body.token, req.body.platform);
    return ok(res, { message: "Push token registered" });
  } catch (err) {
    next(err);
  }
}

export async function removePushToken(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAppService.removePushToken(req.rider!.id, req.body.token);
    return ok(res, { message: "Push token removed" });
  } catch (err) {
    next(err);
  }
}

// ─── Orders ────────────────────────────────────────────────────

export async function listAvailableOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.rider!.kycStatus !== "VERIFIED") {
      return fail(res, "Your account must be verified before you can receive orders", 403);
    }
    if (!req.rider!.isAvailable) {
      const { page, limit } = paginate((req.query as any).page, (req.query as any).limit);
      return ok(res, { data: [], meta: buildMeta(page, limit, 0) });
    }
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await riderOrderService.listAvailableOrders({ type: q.type, page, limit });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await riderOrderService.listRiderOrders(req.rider!.id, {
      status: q.status as OrderStatus | undefined,
      page,
      limit,
    });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getActiveOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.getActiveOrder(req.rider!.id);
    return ok(res, { data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.getRiderOrderDetail(req.rider!.id, req.params.id);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message === "Order no longer available") return fail(res, err.message, 410);
    next(err);
  }
}

export async function acceptOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.rider!.kycStatus !== "VERIFIED") {
      return fail(res, "Your account must be verified before you can accept orders", 403);
    }
    const order = await riderOrderService.acceptOrder(req.rider!.id, req.params.id);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message === "Order is not available for acceptance") return fail(res, err.message, 400);
    if (err.message === "Truck orders cannot be accepted from the rider app") return fail(res, err.message, 400);
    if (err.message === "Order has already been accepted by another rider") return fail(res, err.message, 409);
    if (err.message?.includes("already have an active order")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function rejectOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.rejectOrder(req.rider!.id, req.params.id, req.body.reason);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("cannot be rejected")) return fail(res, err.message, 400);
    next(err);
  }
}

export async function markPickedUp(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.markPickedUp(req.rider!.id, req.params.id);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("cannot be marked")) return fail(res, err.message, 400);
    next(err);
  }
}

export async function markInTransit(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.markInTransit(req.rider!.id, req.params.id);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("must be picked up")) return fail(res, err.message, 400);
    next(err);
  }
}

export async function markDelivered(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.confirmationCode) return fail(res, "Confirmation code is required", 400);
    const order = await riderOrderService.markDelivered(
      req.rider!.id,
      req.params.id,
      req.body.confirmationCode,
      req.body.proofNote
    );
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("must be") || err.message?.includes("Invalid confirmation")) {
      return fail(res, err.message, 400);
    }
    next(err);
  }
}

export async function markFailed(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await riderOrderService.markFailed(req.rider!.id, req.params.id, req.body.reason);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot mark")) return fail(res, err.message, 400);
    next(err);
  }
}

export async function markDropoffDelivered(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.confirmationCode) return fail(res, "Confirmation code is required", 400);
    const dropoff = await riderOrderService.markDropoffDelivered(
      req.rider!.id,
      req.params.id,
      req.params.dropoffId,
      req.body.confirmationCode,
      req.body.proofNote
    );
    return ok(res, { data: dropoff });
  } catch (err: any) {
    if (err.message === "Order not found" || err.message === "Parcel not found") {
      return fail(res, err.message, 404);
    }
    if (
      err.message?.includes("must be") ||
      err.message?.includes("Invalid confirmation") ||
      err.message?.includes("already been")
    ) {
      return fail(res, err.message, 400);
    }
    next(err);
  }
}

export async function markDropoffFailed(req: Request, res: Response, next: NextFunction) {
  try {
    const dropoff = await riderOrderService.markDropoffFailed(
      req.rider!.id,
      req.params.id,
      req.params.dropoffId,
      req.body.reason
    );
    return ok(res, { data: dropoff });
  } catch (err: any) {
    if (err.message === "Order not found" || err.message === "Parcel not found") {
      return fail(res, err.message, 404);
    }
    if (err.message?.includes("Cannot fail") || err.message?.includes("already been")) {
      return fail(res, err.message, 400);
    }
    next(err);
  }
}

export async function pushLocationUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    await riderOrderService.pushLocationUpdate(req.rider!.id, req.params.id, req.body.lat, req.body.lng);
    return ok(res, { message: "Location updated" });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    next(err);
  }
}

// ─── Earnings ──────────────────────────────────────────────────

export async function listEarnings(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await riderEarningService.listEarnings(req.rider!.id, page, limit);
    return ok(res, { data: serializeMoneyList(result.data, ["amount"]), meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getEarningsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await riderEarningService.getEarningsSummary(req.rider!.id);
    return ok(res, {
      data: {
        total: toNaira(summary.totalKobo),
        today: toNaira(summary.todayKobo),
        thisWeek: toNaira(summary.thisWeekKobo),
        thisMonth: toNaira(summary.thisMonthKobo),
        pendingBalance: toNaira(summary.pendingBalanceKobo),
        deliveryCount: summary.deliveryCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function requestWithdrawal(req: Request, res: Response, next: NextFunction) {
  try {
    const { amountKobo, bankName, bankCode, accountNumber, accountName } = req.body;
    const rider = req.rider!;
    const bank = {
      bankName: bankName || rider.bankName || "",
      bankCode: bankCode || rider.bankCode || "",
      accountNumber: accountNumber || rider.accountNumber || "",
      accountName: accountName || rider.accountName || "",
    };
    if (!bank.bankName || !bank.accountNumber) {
      return fail(res, "Bank account details required", 400);
    }
    const withdrawal = await riderEarningService.requestWithdrawal(rider.id, amountKobo, bank);
    return ok(res, { data: serializeMoney(withdrawal, ["amount"]) }, 201);
  } catch (err: any) {
    if (
      err.message === "Insufficient balance" ||
      err.message?.includes("Minimum withdrawal") ||
      err.message?.includes("No bank account on file")
    ) {
      return fail(res, err.message, 400);
    }
    next(err);
  }
}

export async function listWithdrawals(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await riderEarningService.listWithdrawals(req.rider!.id, page, limit);
    return ok(res, { data: serializeMoneyList(result.data, ["amount"]), meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

// ─── Notifications ─────────────────────────────────────────────

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await riderAppService.listNotifications(req.rider!.id, page, limit);
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await riderAppService.getUnreadCount(req.rider!.id);
    return ok(res, { count });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const n = await riderAppService.markNotificationRead(req.rider!.id, req.params.id);
    return ok(res, { data: n });
  } catch (err: any) {
    if (err.message === "Notification not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await riderAppService.markAllNotificationsRead(req.rider!.id);
    return ok(res, { message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}
