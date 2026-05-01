import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import * as cloudinaryService from "../services/cloudinaryService";
import * as walletService from "../services/walletService";
import { ok, created, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";

// ─── Profile ──────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    ok(res, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      avatarUrl: user.avatarUrl,
      walletBalanceKobo: wallet?.balanceKobo ?? 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
    });
    ok(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, "No file uploaded");
    const avatarUrl = await cloudinaryService.uploadBuffer(req.file.buffer, "avatars");
    await prisma.user.update({ where: { id: req.user!.id }, data: { avatarUrl } });
    ok(res, { avatarUrl });
  } catch (err) {
    next(err);
  }
}

// ─── Addresses ────────────────────────────────────────────────

export async function listAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await prisma.savedAddress.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    ok(res, { addresses });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { label, address, lat, lng, isDefault } = req.body;

    if (isDefault) {
      await prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const saved = await prisma.savedAddress.create({
      data: { userId, label, address, lat, lng, isDefault: isDefault ?? false },
    });
    created(res, { address: saved });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.savedAddress.findFirst({ where: { id, userId } });
    if (!existing) return fail(res, "Address not found", 404);

    if (req.body.isDefault) {
      await prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    const updated = await prisma.savedAddress.update({ where: { id }, data: req.body });
    ok(res, { address: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const existing = await prisma.savedAddress.findFirst({ where: { id, userId } });
    if (!existing) return fail(res, "Address not found", 404);
    await prisma.savedAddress.delete({ where: { id } });
    ok(res, { message: "Address deleted" });
  } catch (err) {
    next(err);
  }
}

// ─── Wallet ───────────────────────────────────────────────────

export async function getWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const balanceKobo = await walletService.getBalance(req.user!.id);
    ok(res, { balanceKobo });
  } catch (err) {
    next(err);
  }
}

export async function getWalletTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const { data, total } = await walletService.getTransactions(req.user!.id, page, limit);
    ok(res, { data, meta: buildMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

export async function initTopUp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await walletService.initTopUp(req.user!.id, req.body.amountKobo);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function verifyTopUp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await walletService.verifyTopUp(req.user!.id, req.body.reference);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── Push tokens ──────────────────────────────────────────────

export async function registerPushToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, platform } = req.body;
    await prisma.pushToken.upsert({
      where: { userId_token: { userId: req.user!.id, token } },
      update: { platform },
      create: { userId: req.user!.id, token, platform },
    });
    ok(res, { message: "Push token registered" });
  } catch (err) {
    next(err);
  }
}

// ─── Notifications ────────────────────────────────────────────

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const isRead = req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;
    const where: any = { userId: req.user!.id };
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);

    ok(res, { data, meta: buildMeta(page, limit, total), unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { ids } = req.body;

    const where: any = { userId };
    if (ids?.length) where.id = { in: ids };

    await prisma.notification.updateMany({ where, data: { isRead: true } });
    ok(res, { message: "Notifications marked as read" });
  } catch (err) {
    next(err);
  }
}
