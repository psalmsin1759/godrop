import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  Investor,
  InvestorTxType,
  InvestorWalletKind,
  InvestorTxStatus,
  InvestmentStatus,
  InvestmentPayoutStatus,
  FlowSafeVaultKind,
  FlowSafeVaultStatus,
  InvestmentVehicleClass,
  Prisma,
} from "@prisma/client";
import * as paystackService from "./paystackService";

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;

// ─── Auth ─────────────────────────────────────────────────────

function accessToken(investorId: string): string {
  return jwt.sign({ investorId, type: "investor" }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TTL,
  });
}

async function createRefreshToken(investorId: string): Promise<string> {
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);
  await prisma.investorRefreshToken.create({ data: { token, investorId, expiresAt } });
  return token;
}

export async function issueTokens(investor: Investor) {
  const refresh = await createRefreshToken(investor.id);
  return { accessToken: accessToken(investor.id), refreshToken: refresh };
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.investorRefreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }
  await prisma.investorRefreshToken.delete({ where: { id: record.id } });
  const investor = await prisma.investor.findUniqueOrThrow({ where: { id: record.investorId } });
  return issueTokens(investor);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.investorRefreshToken.deleteMany({ where: { token } });
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Investor> {
  const existing = await prisma.investor.findFirst({
    where: { OR: [{ email: data.email }, { phone: data.phone }] },
  });
  if (existing) {
    throw new Error(existing.email === data.email ? "EMAIL_TAKEN" : "PHONE_TAKEN");
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const referralCode = `GDI${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const username = `@${data.firstName}_${data.lastName}`.toLowerCase().replace(/[^a-z0-9_@]/g, "");
  const investor = await prisma.investor.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      referralCode,
      username: `${username}${Math.floor(Math.random() * 90 + 10)}`,
      isEmailVerified: false,
      wallet: { create: {} },
      settings: { create: {} },
    },
  });
  return investor;
}

export async function markPhoneVerified(phone: string): Promise<Investor | null> {
  const investor = await prisma.investor.findUnique({ where: { phone } });
  if (!investor) return null;
  return prisma.investor.update({ where: { id: investor.id }, data: { isPhoneVerified: true } });
}

export async function loginWithPassword(identifier: string, password: string): Promise<Investor | null> {
  const investor = await prisma.investor.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }], status: "ACTIVE" },
  });
  if (!investor) return null;
  const valid = await bcrypt.compare(password, investor.passwordHash);
  return valid ? investor : null;
}

// ─── Serializers ──────────────────────────────────────────────

export function serializeInvestor(i: Investor) {
  return {
    id: i.id,
    firstName: i.firstName,
    lastName: i.lastName,
    username: i.username,
    email: i.email,
    phone: i.phone,
    avatarUrl: i.avatarUrl,
    dateOfBirth: i.dateOfBirth,
    address: i.address,
    referralCode: i.referralCode,
    isPhoneVerified: i.isPhoneVerified,
    isEmailVerified: i.isEmailVerified,
    kyc: kycSummary(i),
    createdAt: i.createdAt,
  };
}

export function kycSummary(i: Investor) {
  const steps = [
    { key: "email", label: "Email address", status: i.isEmailVerified ? "VERIFIED" : "NOT_STARTED" },
    { key: "phone", label: "Phone number", status: i.isPhoneVerified ? "VERIFIED" : "NOT_STARTED" },
    { key: "bvn", label: "BVN verification", status: i.bvnStatus },
    { key: "governmentId", label: "Government ID", status: i.idStatus },
    { key: "proofOfAddress", label: "Proof of address", status: i.addressProofStatus },
  ];
  const verified = steps.filter((s) => s.status === "VERIFIED").length;
  // Tier 1: contact verified · Tier 2: + BVN · Tier 3: + ID and address proof
  let tier = 0;
  if (i.isEmailVerified && i.isPhoneVerified) tier = 1;
  if (tier === 1 && i.bvnStatus === "VERIFIED") tier = 2;
  if (tier === 2 && i.idStatus === "VERIFIED" && i.addressProofStatus === "VERIFIED") tier = 3;
  const tierNames = ["Unverified", "Tier 1 · Basic", "Tier 2 · Advanced", "Tier 3 · Full"];
  const limits = [0, 500000000, 1000000000, 5000000000]; // Kobo: ₦5M, ₦10M, ₦50M
  return {
    tier,
    tierName: tierNames[tier],
    investmentLimitKobo: limits[tier],
    progressPct: Math.round((verified / steps.length) * 100),
    steps,
  };
}

// ─── Wallet ───────────────────────────────────────────────────

export async function getOrCreateWallet(investorId: string) {
  let wallet = await prisma.investorWallet.findUnique({ where: { investorId } });
  if (!wallet) {
    wallet = await prisma.investorWallet.create({ data: { investorId } });
  }
  return wallet;
}

export async function safeBalanceKobo(investorId: string): Promise<number> {
  const agg = await prisma.flowSafeVault.aggregate({
    where: { investorId, status: FlowSafeVaultStatus.ACTIVE },
    _sum: { principalKobo: true, interestEarnedKobo: true },
  });
  return (agg._sum.principalKobo ?? 0) + (agg._sum.interestEarnedKobo ?? 0);
}

export async function walletSummary(investorId: string) {
  const wallet = await getOrCreateWallet(investorId);
  const safeKobo = await safeBalanceKobo(investorId);
  return {
    mainBalanceKobo: wallet.mainBalanceKobo,
    payoutBalanceKobo: wallet.payoutBalanceKobo,
    safeBalanceKobo: safeKobo,
  };
}

export async function initializeFunding(investor: Investor, amountKobo: number, method: string) {
  const reference = `GD-TOP-${nanoid(10)}`;
  const init = await paystackService.initializeTransaction({
    email: investor.email,
    amountKobo,
    reference,
    metadata: { domain: "investor", purpose: "WALLET_TOPUP", method },
  });
  await prisma.investorTransaction.create({
    data: {
      investorId: investor.id,
      type: InvestorTxType.TOPUP,
      wallet: InvestorWalletKind.MAIN,
      amountKobo,
      reference,
      description: `Wallet top-up via ${method.toLowerCase()}`,
      status: InvestorTxStatus.PENDING,
    },
  });
  return { reference, authorizationUrl: init.authorizationUrl };
}

export async function verifyFunding(investorId: string, reference: string) {
  const tx = await prisma.investorTransaction.findUnique({ where: { reference } });
  if (!tx || tx.investorId !== investorId || tx.type !== InvestorTxType.TOPUP) {
    throw new Error("REFERENCE_NOT_FOUND");
  }
  if (tx.status === InvestorTxStatus.COMPLETED) return tx; // idempotent
  const result = await paystackService.verifyTransaction(reference);
  if (result.status !== "success") throw new Error("PAYMENT_NOT_CONFIRMED");
  const [updated] = await prisma.$transaction([
    prisma.investorTransaction.update({
      where: { reference },
      data: { status: InvestorTxStatus.COMPLETED },
    }),
    prisma.investorWallet.update({
      where: { investorId },
      data: { mainBalanceKobo: { increment: tx.amountKobo } },
    }),
  ]);
  return updated;
}

const WITHDRAWAL_FEE_KOBO = 5000; // flat ₦50

export async function withdraw(
  investor: Investor,
  amountKobo: number,
  walletKind: "MAIN" | "PAYOUT",
  bankAccountId: string
) {
  const bank = await prisma.investorBankAccount.findFirst({
    where: { id: bankAccountId, investorId: investor.id },
  });
  if (!bank) throw new Error("BANK_ACCOUNT_NOT_FOUND");

  const wallet = await getOrCreateWallet(investor.id);
  const balance = walletKind === "MAIN" ? wallet.mainBalanceKobo : wallet.payoutBalanceKobo;
  if (balance < amountKobo) throw new Error("INSUFFICIENT_BALANCE");

  const reference = `GD-WDR-${nanoid(10)}`;
  const balanceField = walletKind === "MAIN" ? "mainBalanceKobo" : "payoutBalanceKobo";

  const tx = await prisma.$transaction(async (db) => {
    await db.investorWallet.update({
      where: { investorId: investor.id },
      data: { [balanceField]: { decrement: amountKobo } },
    });
    return db.investorTransaction.create({
      data: {
        investorId: investor.id,
        type: InvestorTxType.WITHDRAWAL,
        wallet: walletKind as InvestorWalletKind,
        amountKobo,
        reference,
        description: `Withdrawal · ${bank.bankName} ····${bank.accountNumber.slice(-4)}`,
        status: InvestorTxStatus.PENDING,
      },
    });
  });

  try {
    const recipient = await paystackService.createTransferRecipient({
      name: bank.accountName,
      accountNumber: bank.accountNumber,
      bankCode: bank.bankCode,
    });
    await paystackService.initiateTransfer({
      amountKobo: amountKobo - WITHDRAWAL_FEE_KOBO,
      recipient,
      reference,
      reason: "GoDrop Invest withdrawal",
    });
    return prisma.investorTransaction.update({
      where: { id: tx.id },
      data: { status: InvestorTxStatus.COMPLETED },
    });
  } catch (err) {
    // refund on transfer failure
    await prisma.$transaction([
      prisma.investorWallet.update({
        where: { investorId: investor.id },
        data: { [balanceField]: { increment: amountKobo } },
      }),
      prisma.investorTransaction.update({
        where: { id: tx.id },
        data: { status: InvestorTxStatus.FAILED },
      }),
    ]);
    throw err;
  }
}

// ─── Assets & plans ───────────────────────────────────────────

export function serializeAsset(a: {
  id: string;
  name: string;
  shortCode: string;
  vehicleClass: InvestmentVehicleClass;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  unitPriceKobo: number;
  minInvestKobo: number;
  projectedRoiBps: number;
  tenureMonths: number;
  monthlyPayoutKobo: number;
  targetKobo: number;
  raisedKobo: number;
  slotsTotal: number;
  slotsLeft: number;
  investorCount: number;
  isHot: boolean;
  status: string;
}) {
  return {
    ...a,
    fundedPct: a.targetKobo > 0 ? Math.round((a.raisedKobo / a.targetKobo) * 100) : 0,
  };
}

export async function listAssets(vehicleClass?: InvestmentVehicleClass) {
  const assets = await prisma.investmentAsset.findMany({
    where: {
      status: { in: ["OPEN", "FUNDED"] },
      ...(vehicleClass ? { vehicleClass } : {}),
    },
    orderBy: [{ isHot: "desc" }, { createdAt: "desc" }],
  });
  return assets.map(serializeAsset);
}

export async function listAssetClasses() {
  const grouped = await prisma.investmentAsset.groupBy({
    by: ["vehicleClass"],
    where: { status: "OPEN" },
    _count: { _all: true },
  });
  const labels: Record<string, string> = {
    KEKE: "Keke",
    SHUTTLE: "Shuttle",
    RIDE_CAR: "Ride car",
    BIKE: "Bike",
  };
  return grouped.map((g) => ({
    vehicleClass: g.vehicleClass,
    label: labels[g.vehicleClass] ?? g.vehicleClass,
    count: g._count._all,
  }));
}

export async function listPlans() {
  return prisma.investmentPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Investment flow ──────────────────────────────────────────

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function previewInvestment(assetId: string, planId: string, amountKobo: number) {
  const [asset, plan] = await Promise.all([
    prisma.investmentAsset.findUnique({ where: { id: assetId } }),
    prisma.investmentPlan.findUnique({ where: { id: planId } }),
  ]);
  if (!asset) throw new Error("ASSET_NOT_FOUND");
  if (!plan || !plan.active) throw new Error("PLAN_NOT_FOUND");
  const minKobo = Math.max(asset.minInvestKobo, plan.minAmountKobo);
  if (amountKobo < minKobo) throw new Error(`MIN_AMOUNT:${minKobo}`);
  const remainingKobo = asset.targetKobo - asset.raisedKobo;
  if (amountKobo > remainingKobo) throw new Error(`MAX_AMOUNT:${remainingKobo}`);

  const monthlyPayoutKobo = Math.floor((amountKobo * plan.monthlyRateBps) / 10000);
  const totalReturnKobo = amountKobo + monthlyPayoutKobo * plan.tenureMonths;
  const maturesAt = addMonths(new Date(), plan.tenureMonths);
  return {
    asset: serializeAsset(asset),
    plan,
    amountKobo,
    minKobo,
    remainingKobo,
    monthlyPayoutKobo,
    totalReturnKobo,
    tenureMonths: plan.tenureMonths,
    maturesAt,
    firstPayoutAt: addMonths(new Date(), 1),
  };
}

async function activateInvestment(db: Prisma.TransactionClient, investmentId: string) {
  const investment = await db.investment.findUniqueOrThrow({
    where: { id: investmentId },
    include: { plan: true, asset: true },
  });
  const now = new Date();
  const maturesAt = addMonths(now, investment.plan.tenureMonths);
  await db.investment.update({
    where: { id: investment.id },
    data: { status: InvestmentStatus.ACTIVE, startedAt: now, maturesAt },
  });
  await db.investmentPayout.createMany({
    data: Array.from({ length: investment.plan.tenureMonths }, (_, idx) => ({
      investmentId: investment.id,
      sequence: idx + 1,
      dueDate: addMonths(now, idx + 1),
      amountKobo: investment.monthlyPayoutKobo,
    })),
  });
  const raisedKobo = investment.asset.raisedKobo + investment.amountKobo;
  await db.investmentAsset.update({
    where: { id: investment.assetId },
    data: {
      raisedKobo,
      investorCount: { increment: 1 },
      slotsLeft: Math.max(0, investment.asset.slotsLeft - 1),
      status: raisedKobo >= investment.asset.targetKobo ? "FUNDED" : investment.asset.status,
    },
  });
  await db.investorNotification.create({
    data: {
      investorId: investment.investorId,
      title: "Investment active 🎉",
      body: `Your ₦${(investment.amountKobo / 100).toLocaleString("en-NG")} investment in ${investment.asset.name} is now active. First payout ${addMonths(now, 1).toDateString()}.`,
      category: "INVESTMENT",
    },
  });
}

export async function createInvestment(
  investor: Investor,
  data: { assetId: string; planId: string; amountKobo: number; paymentMethod: string }
) {
  const preview = await previewInvestment(data.assetId, data.planId, data.amountKobo);
  const reference = `GD-INV-${nanoid(8).toUpperCase()}`;

  if (data.paymentMethod === "WALLET") {
    const wallet = await getOrCreateWallet(investor.id);
    if (wallet.mainBalanceKobo < data.amountKobo) throw new Error("INSUFFICIENT_BALANCE");

    const investment = await prisma.$transaction(async (db) => {
      await db.investorWallet.update({
        where: { investorId: investor.id },
        data: { mainBalanceKobo: { decrement: data.amountKobo } },
      });
      const inv = await db.investment.create({
        data: {
          reference,
          investorId: investor.id,
          assetId: data.assetId,
          planId: data.planId,
          amountKobo: data.amountKobo,
          monthlyPayoutKobo: preview.monthlyPayoutKobo,
        },
      });
      await db.investorTransaction.create({
        data: {
          investorId: investor.id,
          type: InvestorTxType.INVESTMENT,
          wallet: InvestorWalletKind.MAIN,
          amountKobo: data.amountKobo,
          reference,
          description: `Investment · ${preview.asset.name}`,
        },
      });
      await activateInvestment(db, inv.id);
      return inv;
    });
    return { investment: await getInvestment(investor.id, investment.id), paymentRequired: false };
  }

  // Card / transfer / USSD → Paystack checkout, then verify to activate
  const init = await paystackService.initializeTransaction({
    email: investor.email,
    amountKobo: data.amountKobo,
    reference,
    metadata: { domain: "investor", purpose: "INVESTMENT", method: data.paymentMethod },
  });
  await prisma.investment.create({
    data: {
      reference,
      investorId: investor.id,
      assetId: data.assetId,
      planId: data.planId,
      amountKobo: data.amountKobo,
      monthlyPayoutKobo: preview.monthlyPayoutKobo,
    },
  });
  return {
    paymentRequired: true,
    reference,
    authorizationUrl: init.authorizationUrl,
  };
}

export async function verifyInvestmentPayment(investorId: string, reference: string) {
  const investment = await prisma.investment.findUnique({ where: { reference } });
  if (!investment || investment.investorId !== investorId) throw new Error("REFERENCE_NOT_FOUND");
  if (investment.status !== InvestmentStatus.PENDING_PAYMENT) {
    return getInvestment(investorId, investment.id); // idempotent
  }
  const result = await paystackService.verifyTransaction(reference);
  if (result.status !== "success") throw new Error("PAYMENT_NOT_CONFIRMED");
  await prisma.$transaction(async (db) => {
    await db.investorTransaction.create({
      data: {
        investorId,
        type: InvestorTxType.INVESTMENT,
        wallet: InvestorWalletKind.MAIN,
        amountKobo: investment.amountKobo,
        reference: `${reference}-PAY`,
        description: "Investment payment via Paystack",
      },
    });
    await activateInvestment(db, investment.id);
  });
  return getInvestment(investorId, investment.id);
}

export async function listInvestments(investorId: string, status?: InvestmentStatus) {
  const investments = await prisma.investment.findMany({
    where: { investorId, ...(status ? { status } : { status: { not: "PENDING_PAYMENT" } }) },
    include: {
      asset: true,
      plan: true,
      payouts: { orderBy: { sequence: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return investments.map(serializeInvestment);
}

export async function getInvestment(investorId: string, id: string) {
  const investment = await prisma.investment.findFirst({
    where: { id, investorId },
    include: { asset: true, plan: true, payouts: { orderBy: { sequence: "asc" } } },
  });
  if (!investment) throw new Error("INVESTMENT_NOT_FOUND");
  return serializeInvestment(investment);
}

function serializeInvestment(inv: any) {
  const paid = inv.payouts.filter((p: any) => p.status === InvestmentPayoutStatus.PAID);
  const next = inv.payouts.find((p: any) => p.status === InvestmentPayoutStatus.SCHEDULED);
  return {
    id: inv.id,
    reference: inv.reference,
    status: inv.status,
    amountKobo: inv.amountKobo,
    monthlyPayoutKobo: inv.monthlyPayoutKobo,
    startedAt: inv.startedAt,
    maturesAt: inv.maturesAt,
    monthsPaid: paid.length,
    totalMonths: inv.plan.tenureMonths,
    earnedKobo: paid.reduce((s: number, p: any) => s + p.amountKobo, 0),
    projectedKobo: inv.monthlyPayoutKobo * inv.plan.tenureMonths,
    nextPayout: next ? { dueDate: next.dueDate, amountKobo: next.amountKobo } : null,
    asset: serializeAsset(inv.asset),
    plan: inv.plan,
    payouts: inv.payouts.map((p: any) => ({
      sequence: p.sequence,
      dueDate: p.dueDate,
      amountKobo: p.amountKobo,
      status: p.status,
      paidAt: p.paidAt,
    })),
  };
}

// ─── Portfolio / home summary ─────────────────────────────────

export async function portfolioSummary(investorId: string) {
  const investments = await prisma.investment.findMany({
    where: { investorId, status: { in: ["ACTIVE", "MATURED"] } },
    include: { payouts: true, plan: true },
  });
  const investedKobo = investments
    .filter((i) => i.status === "ACTIVE")
    .reduce((s, i) => s + i.amountKobo, 0);
  const allPaid = investments.flatMap((i) =>
    i.payouts.filter((p) => p.status === InvestmentPayoutStatus.PAID)
  );
  const safeInterest = await prisma.investorTransaction.aggregate({
    where: { investorId, type: InvestorTxType.SAFE_INTEREST, status: InvestorTxStatus.COMPLETED },
    _sum: { amountKobo: true },
  });
  const earnedKobo =
    allPaid.reduce((s, p) => s + p.amountKobo, 0) + (safeInterest._sum.amountKobo ?? 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonthKobo = allPaid
    .filter((p) => p.paidAt && p.paidAt >= monthStart)
    .reduce((s, p) => s + p.amountKobo, 0);

  const nextPayouts = await prisma.investmentPayout.findMany({
    where: {
      investment: { investorId },
      status: InvestmentPayoutStatus.SCHEDULED,
    },
    orderBy: { dueDate: "asc" },
    take: 1,
    include: { investment: { include: { asset: true } } },
  });
  const next = nextPayouts[0];

  return {
    portfolioValueKobo: investedKobo + earnedKobo,
    investedKobo,
    earnedKobo,
    thisMonthKobo,
    activeCount: investments.filter((i) => i.status === "ACTIVE").length,
    maturedCount: investments.filter((i) => i.status === "MATURED").length,
    nextPayout: next
      ? { dueDate: next.dueDate, amountKobo: next.amountKobo, assetName: next.investment.asset.name }
      : null,
  };
}

export async function recentActivity(investorId: string, take = 5) {
  return prisma.investorTransaction.findMany({
    where: { investorId, status: { not: InvestorTxStatus.FAILED } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

// ─── Flow Safe ────────────────────────────────────────────────

// Flexible vaults earn the base rate; locked vaults earn base + bonus by duration.
const SAFE_BASE_RATE_BPS = 1000; // 10% p.a.
function lockedRateBps(lockDays: number): number {
  if (lockDays >= 180) return 1600;
  if (lockDays >= 90) return 1400;
  if (lockDays >= 30) return 1200;
  return SAFE_BASE_RATE_BPS;
}

export async function safeSummary(investorId: string) {
  const vaults = await prisma.flowSafeVault.findMany({
    where: { investorId, status: FlowSafeVaultStatus.ACTIVE },
    orderBy: { createdAt: "asc" },
  });
  const quarterStart = new Date();
  quarterStart.setMonth(quarterStart.getMonth() - 3);
  const interestThisQuarter = await prisma.investorTransaction.aggregate({
    where: {
      investorId,
      type: InvestorTxType.SAFE_INTEREST,
      status: InvestorTxStatus.COMPLETED,
      createdAt: { gte: quarterStart },
    },
    _sum: { amountKobo: true },
  });
  return {
    totalKobo: vaults.reduce((s, v) => s + v.principalKobo + v.interestEarnedKobo, 0),
    interestThisQuarterKobo: interestThisQuarter._sum.amountKobo ?? 0,
    vaults: vaults.map((v) => ({
      ...v,
      progressPct: vaultProgressPct(v),
    })),
  };
}

function vaultProgressPct(v: { kind: FlowSafeVaultKind; createdAt: Date; unlocksAt: Date | null }) {
  if (v.kind === FlowSafeVaultKind.FLEXIBLE || !v.unlocksAt) return 100;
  const total = v.unlocksAt.getTime() - v.createdAt.getTime();
  const elapsed = Date.now() - v.createdAt.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export async function createVault(
  investor: Investor,
  data: { name: string; amountKobo: number; lockDays?: number }
) {
  const wallet = await getOrCreateWallet(investor.id);
  if (wallet.mainBalanceKobo < data.amountKobo) throw new Error("INSUFFICIENT_BALANCE");

  const locked = !!data.lockDays && data.lockDays > 0;
  const vault = await prisma.$transaction(async (db) => {
    await db.investorWallet.update({
      where: { investorId: investor.id },
      data: { mainBalanceKobo: { decrement: data.amountKobo } },
    });
    const v = await db.flowSafeVault.create({
      data: {
        investorId: investor.id,
        name: data.name,
        kind: locked ? FlowSafeVaultKind.LOCKED : FlowSafeVaultKind.FLEXIBLE,
        principalKobo: data.amountKobo,
        interestRateBps: locked ? lockedRateBps(data.lockDays!) : SAFE_BASE_RATE_BPS,
        lockDays: locked ? data.lockDays : null,
        unlocksAt: locked ? new Date(Date.now() + data.lockDays! * 86400 * 1000) : null,
      },
    });
    await db.investorTransaction.create({
      data: {
        investorId: investor.id,
        type: InvestorTxType.SAFE_LOCK,
        wallet: InvestorWalletKind.SAFE,
        amountKobo: data.amountKobo,
        reference: `GD-SAFE-${nanoid(10)}`,
        description: `Flow Safe lock · ${data.name}`,
      },
    });
    return v;
  });
  return { ...vault, progressPct: vaultProgressPct(vault) };
}

export async function withdrawFromVault(investorId: string, vaultId: string, amountKobo: number) {
  const vault = await prisma.flowSafeVault.findFirst({
    where: { id: vaultId, investorId, status: FlowSafeVaultStatus.ACTIVE },
  });
  if (!vault) throw new Error("VAULT_NOT_FOUND");
  if (vault.kind === FlowSafeVaultKind.LOCKED && vault.unlocksAt && vault.unlocksAt > new Date()) {
    throw new Error("VAULT_LOCKED");
  }
  const available = vault.principalKobo + vault.interestEarnedKobo;
  if (amountKobo > available) throw new Error("INSUFFICIENT_BALANCE");

  await prisma.$transaction(async (db) => {
    const fromInterest = Math.min(amountKobo, vault.interestEarnedKobo);
    const fromPrincipal = amountKobo - fromInterest;
    const remaining = available - amountKobo;
    await db.flowSafeVault.update({
      where: { id: vault.id },
      data: {
        interestEarnedKobo: { decrement: fromInterest },
        principalKobo: { decrement: fromPrincipal },
        status: remaining === 0 ? FlowSafeVaultStatus.CLOSED : FlowSafeVaultStatus.ACTIVE,
      },
    });
    await db.investorWallet.update({
      where: { investorId },
      data: { mainBalanceKobo: { increment: amountKobo } },
    });
    await db.investorTransaction.create({
      data: {
        investorId,
        type: InvestorTxType.SAFE_UNLOCK,
        wallet: InvestorWalletKind.SAFE,
        amountKobo,
        reference: `GD-SAFE-${nanoid(10)}`,
        description: `Flow Safe withdrawal · ${vault.name}`,
      },
    });
  });
  return walletSummary(investorId);
}

// ─── Support ──────────────────────────────────────────────────

export const FAQS = [
  {
    question: "How are monthly payouts calculated?",
    answer:
      "Each payout is your share of the vehicle's net earnings at your plan's rate. It lands in your Payout Wallet on the 1st of every month.",
  },
  {
    question: "When can I withdraw my capital?",
    answer:
      "Your capital is locked for your plan's tenure and returned in full at maturity. Monthly payouts can be withdrawn anytime.",
  },
  {
    question: "What happens if a vehicle is damaged?",
    answer:
      "All GoDrop Invest vehicles carry comprehensive insurance. Repairs are covered and your payout schedule continues; total-loss events trigger an insurance payout to investors.",
  },
  {
    question: "Are my investments insured?",
    answer:
      "Yes — every vehicle is insured and operated by a vetted GoDrop rider. However, returns are projected, not guaranteed, and capital is at risk.",
  },
  {
    question: "What is Flow Safe?",
    answer:
      "Flow Safe lets you lock part of your wallet to earn extra interest (10–16% p.a.). Flexible vaults can be withdrawn anytime; locked vaults earn more.",
  },
];
