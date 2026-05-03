import { prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";

export async function createRiderEarning(riderId: string, orderId: string, amountKobo: number) {
  return prisma.riderEarning.upsert({
    where: { orderId },
    update: {},
    create: { riderId, orderId, amountKobo, status: "PENDING" },
  });
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

  const pendingBalance = await prisma.riderEarning.aggregate({
    where: { riderId, status: "PENDING" },
    _sum: { amountKobo: true },
  });

  const available = pendingBalance._sum.amountKobo ?? 0;
  if (amountKobo > available) throw new Error("Insufficient balance");
  if (amountKobo < 100_00) throw new Error("Minimum withdrawal is ₦100 (10,000 kobo)");

  const withdrawal = await prisma.riderWithdrawal.create({
    data: {
      riderId,
      amountKobo,
      bankName: bankDetails.bankName || rider.bankName!,
      bankCode: bankDetails.bankCode || rider.bankCode!,
      accountNumber: bankDetails.accountNumber || rider.accountNumber!,
      accountName: bankDetails.accountName || rider.accountName!,
      status: "PENDING",
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
