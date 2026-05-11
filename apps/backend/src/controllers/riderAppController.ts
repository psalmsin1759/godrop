import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";
import * as otpService from "../services/otpService";
import * as riderAuthService from "../services/riderAuthService";
import * as riderAppService from "../services/riderAppService";
import * as riderOrderService from "../services/riderOrderService";
import * as riderEarningService from "../services/riderEarningService";
import { uploadDocument } from "../services/cloudinaryService";
import { submitKycBodySchema } from "../validators/riderAppValidators";
import { onboardRiderSchema } from "../validators/riderOnboardingValidators";
import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";

// ─── Onboarding (public) ──────────────────────────────────────

export async function onboardRider(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = onboardRiderSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);

    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>;

    let guarantors: any[] = [];
    if (req.body.guarantors) {
      try {
        guarantors = JSON.parse(req.body.guarantors);
        if (!Array.isArray(guarantors)) return fail(res, "guarantors must be a JSON array", 400);
      } catch {
        return fail(res, "Invalid guarantors JSON", 400);
      }
    }

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

    const rider = await riderAppService.onboardRider(parsed.data, guarantors, documents);
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

    const tokens = await riderAuthService.issueTokens(rider);
    return ok(res, { ...tokens, rider });
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
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getEarningsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await riderEarningService.getEarningsSummary(req.rider!.id);
    return ok(res, { data: summary });
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
    return ok(res, { data: withdrawal }, 201);
  } catch (err: any) {
    if (err.message === "Insufficient balance" || err.message?.includes("Minimum withdrawal")) {
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
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
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
