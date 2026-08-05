import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ok, fail, created } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";
import * as investorService from "../services/investorService";
import * as otpService from "../services/otpService";
import * as paystackService from "../services/paystackService";
import {
  InvestmentStatus,
  InvestmentVehicleClass,
  InvestorTxType,
  InvestorKycStepStatus,
} from "@prisma/client";

function investor(req: Request) {
  return req.investor!;
}

// ─── Auth ─────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const inv = await investorService.register(req.body);
    await otpService.sendOtp(inv.phone);
    created(res, {
      investor: investorService.serializeInvestor(inv),
      message: "Account created. Verify your phone with the OTP we sent.",
    });
  } catch (err: any) {
    if (err.message === "EMAIL_TAKEN") return fail(res, "An account with this email already exists", 409);
    if (err.message === "PHONE_TAKEN") return fail(res, "An account with this phone already exists", 409);
    if (err instanceof otpService.OtpCooldownError) {
      return fail(res, `Please wait ${err.retryAfter}s before requesting another code.`, 429, {
        retryAfter: err.retryAfter,
      });
    }
    next(err);
  }
}

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { expiresIn } = await otpService.sendOtp(req.body.phone);
    ok(res, { message: "OTP sent", expiresIn });
  } catch (err) {
    if (err instanceof otpService.OtpCooldownError) {
      return fail(res, `Please wait ${err.retryAfter}s before requesting another code.`, 429, {
        retryAfter: err.retryAfter,
      });
    }
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, code } = req.body;
    const valid = await otpService.verifyOtp(phone, code);
    if (!valid) return fail(res, "Invalid or expired OTP", 401);
    const inv = await investorService.markPhoneVerified(phone);
    if (!inv) return fail(res, "No investor account for this phone", 404);
    const tokens = await investorService.issueTokens(inv);
    ok(res, { ...tokens, investor: investorService.serializeInvestor(inv) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;
    const inv = await investorService.loginWithPassword(identifier, password);
    if (!inv) return fail(res, "Invalid credentials", 401);
    const tokens = await investorService.issueTokens(inv);
    ok(res, { ...tokens, investor: investorService.serializeInvestor(inv) });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await investorService.rotateRefreshToken(req.body.refreshToken);
    ok(res, tokens);
  } catch (err: any) {
    if (err.message === "INVALID_REFRESH_TOKEN") return fail(res, "Invalid or expired refresh token", 401);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await investorService.revokeRefreshToken(req.body.refreshToken);
    ok(res, { message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

// ─── Home ─────────────────────────────────────────────────────

export async function home(req: Request, res: Response, next: NextFunction) {
  try {
    const inv = investor(req);
    const [portfolio, wallets, classes, assets, activity, unread] = await Promise.all([
      investorService.portfolioSummary(inv.id),
      investorService.walletSummary(inv.id),
      investorService.listAssetClasses(),
      investorService.listAssets(),
      investorService.recentActivity(inv.id),
      prisma.investorNotification.count({ where: { investorId: inv.id, read: false } }),
    ]);
    ok(res, {
      investor: investorService.serializeInvestor(inv),
      portfolio,
      wallets,
      assetClasses: classes,
      assets: assets.slice(0, 6),
      recentActivity: activity,
      unreadNotifications: unread,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Assets & plans ───────────────────────────────────────────

export async function listAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = (req.query.class as string | undefined)?.toUpperCase();
    let vehicleClass: InvestmentVehicleClass | undefined;
    if (raw) {
      if (!(raw in InvestmentVehicleClass)) return fail(res, "Unknown vehicle class");
      vehicleClass = raw as InvestmentVehicleClass;
    }
    const assets = await investorService.listAssets(vehicleClass);
    ok(res, { data: assets });
  } catch (err) {
    next(err);
  }
}

export async function getAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await prisma.investmentAsset.findUnique({ where: { id: req.params.id } });
    if (!asset) return fail(res, "Asset not found", 404);
    ok(res, { data: investorService.serializeAsset(asset) });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: await investorService.listPlans() });
  } catch (err) {
    next(err);
  }
}

// ─── Investments ──────────────────────────────────────────────

export async function previewInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const { assetId, planId, amountKobo } = req.body;
    const preview = await investorService.previewInvestment(assetId, planId, amountKobo);
    ok(res, { data: preview });
  } catch (err: any) {
    if (err.message === "ASSET_NOT_FOUND") return fail(res, "Asset not found", 404);
    if (err.message === "PLAN_NOT_FOUND") return fail(res, "Plan not found", 404);
    if (err.message?.startsWith("MIN_AMOUNT:"))
      return fail(res, `Amount is below the minimum for this plan (${err.message.split(":")[1]} Kobo)`);
    if (err.message?.startsWith("MAX_AMOUNT:"))
      return fail(res, `Amount exceeds what is left to fund (${err.message.split(":")[1]} Kobo)`);
    next(err);
  }
}

export async function createInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await investorService.createInvestment(investor(req), req.body);
    created(res, result);
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_BALANCE") return fail(res, "Insufficient wallet balance — top up", 402);
    if (err.message === "ASSET_NOT_FOUND") return fail(res, "Asset not found", 404);
    if (err.message === "PLAN_NOT_FOUND") return fail(res, "Plan not found", 404);
    if (err.message?.startsWith("MIN_AMOUNT:"))
      return fail(res, `Amount is below the minimum for this plan (${err.message.split(":")[1]} Kobo)`);
    if (err.message?.startsWith("MAX_AMOUNT:"))
      return fail(res, `Amount exceeds what is left to fund (${err.message.split(":")[1]} Kobo)`);
    next(err);
  }
}

export async function verifyInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const investment = await investorService.verifyInvestmentPayment(investor(req).id, req.body.reference);
    ok(res, { data: investment });
  } catch (err: any) {
    if (err.message === "REFERENCE_NOT_FOUND") return fail(res, "Reference not found", 404);
    if (err.message === "PAYMENT_NOT_CONFIRMED") return fail(res, "Payment not confirmed yet", 402);
    next(err);
  }
}

export async function listInvestments(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = (req.query.status as string | undefined)?.toUpperCase();
    let status: InvestmentStatus | undefined;
    if (raw) {
      if (!(raw in InvestmentStatus)) return fail(res, "Unknown status");
      status = raw as InvestmentStatus;
    }
    const [portfolio, investments] = await Promise.all([
      investorService.portfolioSummary(investor(req).id),
      investorService.listInvestments(investor(req).id, status),
    ]);
    ok(res, { portfolio, data: investments });
  } catch (err) {
    next(err);
  }
}

export async function getInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const investment = await investorService.getInvestment(investor(req).id, req.params.id);
    ok(res, { data: investment });
  } catch (err: any) {
    if (err.message === "INVESTMENT_NOT_FOUND") return fail(res, "Investment not found", 404);
    next(err);
  }
}

// ─── Wallet ───────────────────────────────────────────────────

export async function getWallet(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: await investorService.walletSummary(investor(req).id) });
  } catch (err) {
    next(err);
  }
}

export async function fundWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const { amountKobo, method } = req.body;
    const result = await investorService.initializeFunding(investor(req), amountKobo, method);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function verifyFunding(req: Request, res: Response, next: NextFunction) {
  try {
    const tx = await investorService.verifyFunding(investor(req).id, req.body.reference);
    ok(res, { data: tx, wallets: await investorService.walletSummary(investor(req).id) });
  } catch (err: any) {
    if (err.message === "REFERENCE_NOT_FOUND") return fail(res, "Reference not found", 404);
    if (err.message === "PAYMENT_NOT_CONFIRMED") return fail(res, "Payment not confirmed yet", 402);
    next(err);
  }
}

export async function withdraw(req: Request, res: Response, next: NextFunction) {
  try {
    const { amountKobo, wallet, bankAccountId } = req.body;
    const tx = await investorService.withdraw(investor(req), amountKobo, wallet, bankAccountId);
    ok(res, { data: tx, wallets: await investorService.walletSummary(investor(req).id) });
  } catch (err: any) {
    if (err.message === "BANK_ACCOUNT_NOT_FOUND") return fail(res, "Bank account not found", 404);
    if (err.message === "INSUFFICIENT_BALANCE") return fail(res, "Insufficient balance", 402);
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const raw = (req.query.type as string | undefined)?.toUpperCase();
    let type: InvestorTxType | undefined;
    if (raw) {
      if (!(raw in InvestorTxType)) return fail(res, "Unknown transaction type");
      type = raw as InvestorTxType;
    }
    const where = { investorId: investor(req).id, ...(type ? { type } : {}) };
    const [data, total] = await prisma.$transaction([
      prisma.investorTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.investorTransaction.count({ where }),
    ]);
    ok(res, { data, meta: buildMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

// ─── Flow Safe ────────────────────────────────────────────────

export async function getSafe(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: await investorService.safeSummary(investor(req).id) });
  } catch (err) {
    next(err);
  }
}

export async function createVault(req: Request, res: Response, next: NextFunction) {
  try {
    const vault = await investorService.createVault(investor(req), req.body);
    created(res, { data: vault });
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_BALANCE") return fail(res, "Insufficient wallet balance", 402);
    next(err);
  }
}

export async function withdrawFromVault(req: Request, res: Response, next: NextFunction) {
  try {
    const wallets = await investorService.withdrawFromVault(
      investor(req).id,
      req.params.id,
      req.body.amountKobo
    );
    ok(res, { wallets });
  } catch (err: any) {
    if (err.message === "VAULT_NOT_FOUND") return fail(res, "Vault not found", 404);
    if (err.message === "VAULT_LOCKED") return fail(res, "This vault is locked until its unlock date", 403);
    if (err.message === "INSUFFICIENT_BALANCE") return fail(res, "Amount exceeds vault balance", 402);
    next(err);
  }
}

// ─── Profile ──────────────────────────────────────────────────

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: investorService.serializeInvestor(investor(req)) });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await prisma.investor.update({
      where: { id: investor(req).id },
      data: req.body,
    });
    ok(res, { data: investorService.serializeInvestor(updated) });
  } catch (err: any) {
    if (err.code === "P2002") return fail(res, "Username is already taken", 409);
    next(err);
  }
}

// ─── Banks ────────────────────────────────────────────────────

export async function listBanks(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { banks: await paystackService.listBanks() });
  } catch (err) {
    next(err);
  }
}

export async function listBankAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.investorBankAccount.findMany({
      where: { investorId: investor(req).id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
    ok(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function addBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { bankCode, bankName, accountNumber } = req.body;
    const resolved = await paystackService.resolveAccountNumber({ accountNumber, bankCode });
    const count = await prisma.investorBankAccount.count({ where: { investorId: investor(req).id } });
    const account = await prisma.investorBankAccount.create({
      data: {
        investorId: investor(req).id,
        bankCode,
        bankName,
        accountNumber,
        accountName: resolved.accountName,
        isPrimary: count === 0,
      },
    });
    created(res, { data: account });
  } catch (err) {
    next(err);
  }
}

export async function setPrimaryBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await prisma.investorBankAccount.findFirst({
      where: { id: req.params.id, investorId: investor(req).id },
    });
    if (!account) return fail(res, "Bank account not found", 404);
    await prisma.$transaction([
      prisma.investorBankAccount.updateMany({
        where: { investorId: investor(req).id },
        data: { isPrimary: false },
      }),
      prisma.investorBankAccount.update({ where: { id: account.id }, data: { isPrimary: true } }),
    ]);
    ok(res, { message: "Primary bank updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await prisma.investorBankAccount.findFirst({
      where: { id: req.params.id, investorId: investor(req).id },
    });
    if (!account) return fail(res, "Bank account not found", 404);
    await prisma.investorBankAccount.delete({ where: { id: account.id } });
    ok(res, { message: "Bank account removed" });
  } catch (err) {
    next(err);
  }
}

// ─── KYC ──────────────────────────────────────────────────────

export async function getKyc(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: investorService.kycSummary(investor(req)) });
  } catch (err) {
    next(err);
  }
}

export async function submitBvn(req: Request, res: Response, next: NextFunction) {
  try {
    // BVN check runs with the identity provider asynchronously; mark in review.
    const updated = await prisma.investor.update({
      where: { id: investor(req).id },
      data: { bvnStatus: InvestorKycStepStatus.IN_REVIEW },
    });
    ok(res, { data: investorService.kycSummary(updated) });
  } catch (err) {
    next(err);
  }
}

export async function submitIdDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, "Document image is required");
    const updated = await prisma.investor.update({
      where: { id: investor(req).id },
      data: { idStatus: InvestorKycStepStatus.IN_REVIEW },
    });
    ok(res, { data: investorService.kycSummary(updated) });
  } catch (err) {
    next(err);
  }
}

export async function submitAddressProof(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, "Document image is required");
    const updated = await prisma.investor.update({
      where: { id: investor(req).id },
      data: { addressProofStatus: InvestorKycStepStatus.IN_REVIEW },
    });
    ok(res, { data: investorService.kycSummary(updated) });
  } catch (err) {
    next(err);
  }
}

// ─── Settings ─────────────────────────────────────────────────

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.investorSettings.upsert({
      where: { investorId: investor(req).id },
      update: {},
      create: { investorId: investor(req).id },
    });
    ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.investorSettings.upsert({
      where: { investorId: investor(req).id },
      update: req.body,
      create: { investorId: investor(req).id, ...req.body },
    });
    ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

// ─── Notifications ────────────────────────────────────────────

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const where = { investorId: investor(req).id };
    const [data, total, unread] = await prisma.$transaction([
      prisma.investorNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.investorNotification.count({ where }),
      prisma.investorNotification.count({ where: { ...where, read: false } }),
    ]);
    ok(res, { data, unread, meta: buildMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.investorNotification.updateMany({
      where: { id: req.params.id, investorId: investor(req).id },
      data: { read: true },
    });
    ok(res, { message: "Marked read" });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.investorNotification.updateMany({
      where: { investorId: investor(req).id, read: false },
      data: { read: true },
    });
    ok(res, { message: "All marked read" });
  } catch (err) {
    next(err);
  }
}

// ─── Support ──────────────────────────────────────────────────

export async function getFaqs(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { data: investorService.FAQS });
  } catch (err) {
    next(err);
  }
}
