import { prisma } from "../lib/prisma";
import { RiderWithdrawalStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { creditBusinessWalletForEarning } from "./businessAdminService";
import * as paystackService from "./paystackService";
import { nanoid } from "nanoid";

export async function createRiderEarning(
  riderId: string,
  orderId: string,
  amountKobo: number,
  parcelDropoffId?: string
) {
  // Per-parcel earnings are keyed (and de-duplicated) by parcelDropoffId.
  // Order-level earnings (food/grocery/truck/single-parcel legacy) are
  // de-duplicated by checking for an existing earning that isn't tied to a
  // specific parcel.
  if (parcelDropoffId) {
    const earning = await prisma.riderEarning.upsert({
      where: { parcelDropoffId },
      update: {},
      create: { riderId, orderId, parcelDropoffId, amountKobo, status: "PENDING" },
    });
    creditBusinessWalletForEarning(riderId, amountKobo, orderId).catch(() => {});
    return earning;
  }

  const existing = await prisma.riderEarning.findFirst({
    where: { orderId, parcelDropoffId: null },
  });
  if (existing) return existing;

  const earning = await prisma.riderEarning.create({
    data: { riderId, orderId, amountKobo, status: "PENDING" },
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
            deliveryFeeKobo: true,
            createdAt: true,
          },
        },
        // Per-stop fee for parcel orders overrides the order-level fee, since
        // a multi-stop order's total delivery fee is split across its stops.
        parcelDropoff: { select: { deliveryFeeKobo: true } },
      },
    }),
    prisma.riderEarning.count({ where: { riderId } }),
  ]);

  // The rider's cut (amountKobo) was fixed at whatever the platform's
  // riderEarningRate was when this earning was created, so deriving the
  // platform's cut from the stored fee/amount is accurate per-delivery even
  // if the global rate (set via the admin dashboard) has since changed.
  const shaped = data.map(({ order, parcelDropoff, ...earning }) => {
    const deliveryFeeKobo = parcelDropoff?.deliveryFeeKobo ?? order.deliveryFeeKobo;
    const platformCutKobo = Math.max(0, deliveryFeeKobo - earning.amountKobo);
    const riderSharePercent =
      deliveryFeeKobo > 0 ? Math.round((earning.amountKobo / deliveryFeeKobo) * 100) : null;
    const { deliveryFeeKobo: _orderFeeKobo, ...orderRest } = order;
    return {
      ...earning,
      order: orderRest,
      deliveryFeeKobo,
      platformCutKobo,
      riderSharePercent,
    };
  });

  return { data: shaped, total, page, limit };
}

// Withdrawals that have removed (or will remove) money from the rider's balance
const ACTIVE_WITHDRAWAL_STATUSES: RiderWithdrawalStatus[] = ["PENDING", "PROCESSING", "COMPLETED"];

export async function getEarningsSummary(riderId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, today, thisWeek, thisMonth, pendingEarnings, deliveryCount, activeWithdrawals] =
    await prisma.$transaction([
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
      prisma.riderWithdrawal.aggregate({
        where: { riderId, status: { in: ACTIVE_WITHDRAWAL_STATUSES } },
        _sum: { amountKobo: true },
      }),
    ]);

  const pendingBalanceKobo = Math.max(
    0,
    (pendingEarnings._sum.amountKobo ?? 0) - (activeWithdrawals._sum?.amountKobo ?? 0)
  );

  return {
    totalKobo: total._sum.amountKobo ?? 0,
    todayKobo: today._sum.amountKobo ?? 0,
    thisWeekKobo: thisWeek._sum.amountKobo ?? 0,
    thisMonthKobo: thisMonth._sum.amountKobo ?? 0,
    pendingBalanceKobo,
    deliveryCount,
  };
}

type DailyEarningRow = { date: string; deliveries: bigint; earnings_kobo: bigint };

export async function getRiderAnalytics(riderId: string, days: number) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const [rider, dailyRows, typeGroups, deliveredCount, rejectedCount, disputeCount, periodEarnings] = await Promise.all([
    prisma.rider.findUnique({ where: { id: riderId }, select: { rating: true, ratingCount: true } }),
    prisma.$queryRaw<DailyEarningRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS deliveries,
        COALESCE(SUM("amountKobo"), 0)::bigint AS earnings_kobo
      FROM "RiderEarning"
      WHERE "riderId" = ${riderId} AND "createdAt" >= ${from}
      GROUP BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
      ORDER BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Africa/Lagos')
    `,
    prisma.order.groupBy({
      by: ["type"],
      where: { riderId, status: "DELIVERED", createdAt: { gte: from } },
      orderBy: { type: "asc" },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { riderId, status: "DELIVERED", createdAt: { gte: from } } }),
    prisma.riderRejection.count({ where: { riderId, createdAt: { gte: from } } }),
    prisma.dispute.count({ where: { order: { riderId }, createdAt: { gte: from } } }),
    prisma.riderEarning.aggregate({
      where: { riderId, createdAt: { gte: from } },
      _sum: { amountKobo: true },
    }),
  ]);

  return {
    rating: rider?.rating ?? 0,
    ratingCount: rider?.ratingCount ?? 0,
    deliveredCount,
    rejectedCount,
    disputeCount,
    periodEarningsKobo: periodEarnings._sum.amountKobo ?? 0,
    dailyEarnings: dailyRows.map((r) => ({
      date: r.date,
      deliveries: Number(r.deliveries),
      earningsKobo: Number(r.earnings_kobo),
    })),
    ordersByType: typeGroups.map((g) => ({ type: g.type, count: g._count._all })),
  };
}

export async function requestWithdrawal(
  riderId: string,
  amountKobo: number,
  bankDetails: { bankName: string; bankCode: string; accountNumber: string; accountName: string }
) {
  const rider = await prisma.rider.findUniqueOrThrow({ where: { id: riderId } });

  const [pendingEarnings, activeWithdrawals] = await prisma.$transaction([
    prisma.riderEarning.aggregate({
      where: { riderId, status: "PENDING" },
      _sum: { amountKobo: true },
    }),
    prisma.riderWithdrawal.aggregate({
      where: { riderId, status: { in: ACTIVE_WITHDRAWAL_STATUSES } },
      _sum: { amountKobo: true },
    }),
  ]);

  const available =
    (pendingEarnings._sum.amountKobo ?? 0) - (activeWithdrawals._sum?.amountKobo ?? 0);
  if (amountKobo > available) throw new Error("Insufficient balance");
  if (amountKobo < 100_00) throw new Error("Minimum withdrawal is ₦100");

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

  const withdrawal = await prisma.riderWithdrawal.create({
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
  });

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
