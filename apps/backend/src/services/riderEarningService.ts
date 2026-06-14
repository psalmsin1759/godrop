import { prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { creditBusinessWalletForEarning } from "./businessAdminService";
import * as paystackService from "./paystackService";
import { nanoid } from "nanoid";

export async function createRiderEarning(riderId: string, orderId: string, amountKobo: number) {
  const earning = await prisma.riderEarning.upsert({
    where: { orderId },
    update: {},
    create: { riderId, orderId, amountKobo, status: "PENDING" },
  });

  creditBusinessWalletForEarning(riderId, amountKobo, orderId).catch(() => {});

  return earning;
}

export async function listEarnings(riderId: string, page: number, limit: number) {
  const { skip } = paginate(page, limit);
  const [data, total] = await prisma.$transaction([
    prisma.riderEarning.findMany({
      where: { riderId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            trackingCode: true,
            type: true,
            pickupAddress: true,
            dropoffAddress: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.riderEarning.count({ where: { riderId } }),
  ]);
  return { data, total, page, limit };
}

export async function getEarningsSummary(riderId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, today, thisWeek, thisMonth, pendingBalance, deliveryCount] = await prisma.$transaction([
    prisma.riderEarning.aggregate({ where: { riderId }, _sum: { amountKobo: true } }),
    prisma.riderEarning.aggregate({
      where: { riderId, createdAt: { gte: todayStart } },
      _sum: { amountKobo: true },
    }),
    prisma.riderEarning.aggregate({
      where: { riderId, createdAt: { gte: weekStart } },
      _sum: { amountKobo: true },
    }),
    prisma.riderEarning.aggregate({
      where: { riderId, createdAt: { gte: monthStart } },
      _sum: { amountKobo: true },
    }),
    prisma.riderEarning.aggregate({
      where: { riderId, status: "PENDING" },
      _sum: { amountKobo: true },
    }),
    prisma.riderEarning.count({ where: { riderId } }),
  ]);

  return {
    totalKobo: total._sum.amountKobo ?? 0,
    todayKobo: today._sum.amountKobo ?? 0,
    thisWeekKobo: thisWeek._sum.amountKobo ?? 0,
    thisMonthKobo: thisMonth._sum.amountKobo ?? 0,
    pendingBalanceKobo: pendingBalance._sum.amountKobo ?? 0,
    deliveryCount,
  };
}

export async function requestWithdrawal(
  riderId: string,
  amountKobo: number,
  bankDetails: { bankName: string; bankCode: string; accountNumber: string; accountName: string }
) {
  const rider = await prisma.rider.findUniqueOrThrow({ where: { id: riderId } });

  const pendingEarnings = await prisma.riderEarning.findMany({
    where: { riderId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  const available = pendingEarnings.reduce((sum, e) => sum + e.amountKobo, 0);
  if (amountKobo > available) throw new Error("Insufficient balance");
  if (amountKobo < 100_00) throw new Error("Minimum withdrawal is ₦100 (10,000 kobo)");

  const bankName = bankDetails.bankName || rider.bankName;
  const bankCode = bankDetails.bankCode || rider.bankCode;
  const accountNumber = bankDetails.accountNumber || rider.accountNumber;
  const accountName = bankDetails.accountName || rider.accountName;
  if (!bankName || !bankCode || !accountNumber || !accountName) {
    throw new Error("No bank account on file. Please add a bank account first.");
  }

  const reference = `RWD-${nanoid(16)}`;

  const recipientCode = await paystackService.createTransferRecipient({
    name: accountName,
    accountNumber,
    bankCode,
  });

  await paystackService.initiateTransfer({
    amountKobo,
    recipient: recipientCode,
    reference,
    reason: "Rider earnings withdrawal",
  });

  // Settle enough of the oldest PENDING earnings to cover the withdrawn amount
  let remaining = amountKobo;
  const toSettle: string[] = [];
  for (const earning of pendingEarnings) {
    if (remaining <= 0) break;
    toSettle.push(earning.id);
    remaining -= earning.amountKobo;
  }

  const [withdrawal] = await prisma.$transaction([
    prisma.riderWithdrawal.create({
      data: {
        riderId,
        amountKobo,
        bankName,
        bankCode,
        accountNumber,
        accountName,
        reference,
        status: "PROCESSING",
      },
    }),
    prisma.riderEarning.updateMany({
      where: { id: { in: toSettle } },
      data: { status: "SETTLED", settledAt: new Date() },
    }),
  ]);

  return withdrawal;
}

export async function listWithdrawals(riderId: string, page: number, limit: number) {
  const { skip } = paginate(page, limit);
  const [data, total] = await prisma.$transaction([
    prisma.riderWithdrawal.findMany({
      where: { riderId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.riderWithdrawal.count({ where: { riderId } }),
  ]);
  return { data, total, page, limit };
}
