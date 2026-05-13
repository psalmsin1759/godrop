import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import * as paystackService from "../services/paystackService";
import { ok, fail, created } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";
import { nanoid } from "nanoid";
import { VendorWalletTxType } from "@prisma/client";

function vendorId(req: Request): string {
  return req.admin?.vendorId ?? "";
}

export async function getWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const vid = vendorId(req);
    let wallet = await prisma.vendorWallet.findUnique({ where: { vendorId: vid } });
    if (!wallet) {
      wallet = await prisma.vendorWallet.create({ data: { vendorId: vid } });
    }
    ok(res, { balanceKobo: wallet.balanceKobo });
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const vid = vendorId(req);
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const wallet = await prisma.vendorWallet.findUnique({ where: { vendorId: vid } });
    if (!wallet) return ok(res, { data: [], meta: buildMeta(page, limit, 0) });

    const [data, total] = await prisma.$transaction([
      prisma.vendorWalletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendorWalletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    ok(res, { data, meta: buildMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

export async function getBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await prisma.vendorBankAccount.findUnique({ where: { vendorId: vendorId(req) } });
    ok(res, { account });
  } catch (err) {
    next(err);
  }
}

export async function saveBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const vid = vendorId(req);
    const { bankName, bankCode, accountNumber, accountName } = req.body;
    const account = await prisma.vendorBankAccount.upsert({
      where: { vendorId: vid },
      update: { bankName, bankCode, accountNumber, accountName },
      create: { vendorId: vid, bankName, bankCode, accountNumber, accountName },
    });
    ok(res, { account });
  } catch (err) {
    next(err);
  }
}

export async function withdraw(req: Request, res: Response, next: NextFunction) {
  try {
    const vid = vendorId(req);
    const { amountKobo } = req.body;

    const wallet = await prisma.vendorWallet.findUnique({ where: { vendorId: vid } });
    if (!wallet || wallet.balanceKobo < amountKobo) return fail(res, "Insufficient wallet balance", 422);

    const account = await prisma.vendorBankAccount.findUnique({ where: { vendorId: vid } });
    if (!account) return fail(res, "No bank account on file. Please add a bank account first.", 422);

    const reference = `VWD-${nanoid(16)}`;

    // Create Paystack transfer recipient and initiate transfer
    const recipientCode = await paystackService.createTransferRecipient({
      name: account.accountName,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
    });

    await paystackService.initiateTransfer({
      amountKobo,
      recipient: recipientCode,
      reference,
      reason: "Vendor wallet withdrawal",
    });

    // Debit wallet
    await prisma.$transaction([
      prisma.vendorWallet.update({ where: { id: wallet.id }, data: { balanceKobo: { decrement: amountKobo } } }),
      prisma.vendorWalletTransaction.create({
        data: { walletId: wallet.id, type: VendorWalletTxType.WITHDRAWAL, amountKobo, reference, description: "Withdrawal to bank" },
      }),
      prisma.vendorWithdrawal.create({
        data: { vendorId: vid, amountKobo, bankName: account.bankName, bankCode: account.bankCode, accountNumber: account.accountNumber, accountName: account.accountName, reference, status: "PROCESSING" },
      }),
    ]);

    ok(res, { message: "Transfer initiated", reference });
  } catch (err: any) {
    if (err.message?.includes("Insufficient")) return fail(res, err.message, 422);
    next(err);
  }
}
