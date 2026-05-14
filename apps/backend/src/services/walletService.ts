import { prisma } from "../lib/prisma";
import * as paystackService from "./paystackService";
import { WalletTxType } from "@prisma/client";
import { nanoid } from "nanoid";

export async function getBalance(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  return wallet?.balanceKobo ?? 0;
}

export async function getTransactions(userId: string, page: number, limit: number) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return { data: [], total: 0 };

  const [data, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
  ]);

  return { data, total };
}

export async function initTopUp(userId: string, amountKobo: number) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const reference = `GDW-${nanoid(16)}`;
  const result = await paystackService.initializeTransaction({
    email: user.email ?? `${user.phone.replace("+", "")}@wallet.godrop.ng`,
    amountKobo,
    reference,
    metadata: { userId, type: "wallet_topup" },
  });
  return { paystackAuthUrl: result.authorizationUrl, reference };
}

export async function verifyTopUp(userId: string, reference: string) {
  const tx = await paystackService.verifyTransaction(reference);
  if (tx.status !== "success") throw new Error("Payment not successful");

  // Idempotency: check if this reference was already processed
  const existing = await prisma.walletTransaction.findUnique({ where: { reference } });
  if (existing) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return { balanceKobo: wallet!.balanceKobo, transaction: existing };
  }

  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
  const [updated, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balanceKobo: { increment: tx.amountKobo } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTxType.TOPUP,
        amountKobo: tx.amountKobo,
        reference,
        description: "Wallet top-up",
      },
    }),
  ]);

  return { balanceKobo: updated.balanceKobo, transaction };
}

export async function debit(userId: string, amountKobo: number, description: string, reference?: string) {
  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId } });
  if (wallet.balanceKobo < amountKobo) throw new Error("Insufficient wallet balance");

  return prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balanceKobo: { decrement: amountKobo } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTxType.PAYMENT,
        amountKobo,
        reference,
        description,
      },
    }),
  ]);
}

export async function credit(userId: string, amountKobo: number, description: string, reference?: string) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId } });
  }
  await prisma.$transaction([
    prisma.wallet.update({ where: { id: wallet.id }, data: { balanceKobo: { increment: amountKobo } } }),
    prisma.walletTransaction.create({
      data: { walletId: wallet.id, type: WalletTxType.REFUND, amountKobo, reference, description },
    }),
  ]);
}
