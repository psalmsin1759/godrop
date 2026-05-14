import { prisma } from "../lib/prisma";
import { PaymentMethod, PaymentStatus, VendorWalletTxType } from "@prisma/client";
import * as paystackService from "./paystackService";
import * as walletService from "./walletService";
import { nanoid } from "nanoid";

async function fundVendorWallet(orderId: string, amountKobo: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { vendorId: true } });
  if (!order?.vendorId) return;
  const settings = await prisma.platformSettings.findUnique({ where: { id: "global" } });
  const feeRate = settings?.vendorPlatformFeeRate ?? 0.2;
  const vendorShare = Math.floor(amountKobo * (1 - feeRate));
  let wallet = await prisma.vendorWallet.findUnique({ where: { vendorId: order.vendorId } });
  if (!wallet) {
    wallet = await prisma.vendorWallet.create({ data: { vendorId: order.vendorId } });
  }
  await prisma.$transaction([
    prisma.vendorWallet.update({ where: { id: wallet.id }, data: { balanceKobo: { increment: vendorShare } } }),
    prisma.vendorWalletTransaction.create({
      data: { walletId: wallet.id, type: VendorWalletTxType.CREDIT, amountKobo: vendorShare, reference: `ORD-${orderId}`, description: `Order payment` },
    }),
  ]);
}

export async function initializePayment(userId: string, orderId: string, method: string, savedCardId?: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, customerId: userId } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === PaymentStatus.PAID) throw new Error("Order already paid");

  const m = method.toUpperCase() as PaymentMethod;

  if (m === PaymentMethod.WALLET) {
    await walletService.debit(userId, order.totalKobo, `Payment for order ${order.trackingCode}`, orderId);
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PAID, paymentMethod: m },
    });
    await fundVendorWallet(orderId, order.totalKobo).catch(() => {});
    return { method: "wallet", reference: orderId, paid: true };
  }

  if (m === "WALLET_CARD" as any) {
    // Deduct whatever the user has in their wallet (partial), charge the rest via Paystack
    const walletBalance = await walletService.getBalance(userId);
    const walletDeduction = Math.min(walletBalance, order.totalKobo);
    const cardAmountKobo = order.totalKobo - walletDeduction;

    if (walletDeduction > 0) {
      await walletService.debit(userId, walletDeduction, `Partial wallet payment for order ${order.trackingCode}`, orderId);
    }

    if (cardAmountKobo <= 0) {
      // wallet covered the full amount
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.WALLET },
      });
      await fundVendorWallet(orderId, order.totalKobo).catch(() => {});
      return { method: "wallet", reference: orderId, paid: true };
    }

    // Need to charge the remaining cardAmountKobo via Paystack
    const user2 = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const email2 = user2.email ?? `${user2.phone.replace("+", "")}@pay.godrop.ng`;
    const reference2 = `GDO-${nanoid(16)}`;

    const result2 = await paystackService.initializeTransaction({
      email: email2,
      amountKobo: cardAmountKobo,
      reference: reference2,
      metadata: { orderId, userId, type: "order_payment_partial", walletDeductedKobo: walletDeduction },
    });

    await prisma.order.update({ where: { id: orderId }, data: { paystackRef: reference2, paymentMethod: PaymentMethod.WALLET_CARD as any } });

    return { paystackAuthUrl: result2.authorizationUrl, reference: reference2, method: "wallet_card", paid: false, walletDeductedKobo: walletDeduction, cardAmountKobo };
  }

  if (m === PaymentMethod.CASH) {
    await prisma.order.update({ where: { id: orderId }, data: { paymentMethod: m } });
    return { method: "cash", reference: null, paid: false };
  }

  // Card — check for saved card charge
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const email = user.email ?? `${user.phone.replace("+", "")}@pay.godrop.ng`;
  const reference = `GDO-${nanoid(16)}`;

  if (savedCardId) {
    const savedCard = await prisma.savedCard.findFirst({ where: { id: savedCardId, userId } });
    if (savedCard) {
      const result = await paystackService.chargeAuthorization({
        authorizationCode: savedCard.authorizationCode,
        email: savedCard.email,
        amountKobo: order.totalKobo,
        reference,
        metadata: { orderId, userId, type: "order_payment" },
      });
      if (result.status === "success") {
        await prisma.order.update({ where: { id: orderId }, data: { paystackRef: reference, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD } });
        await fundVendorWallet(orderId, order.totalKobo).catch(() => {});
        return { method: "card", reference, paid: true };
      }
    }
  }

  const result = await paystackService.initializeTransaction({
    email,
    amountKobo: order.totalKobo,
    reference,
    metadata: { orderId, userId, type: "order_payment" },
  });

  await prisma.order.update({ where: { id: orderId }, data: { paystackRef: reference } });

  return { paystackAuthUrl: result.authorizationUrl, reference, method: "card", paid: false };
}

export async function verifyPayment(reference: string, userId?: string) {
  // Idempotency: already processed?
  const existingOrder = await prisma.order.findFirst({ where: { paystackRef: reference, paymentStatus: PaymentStatus.PAID } });
  if (existingOrder) return { status: "paid", order: existingOrder };

  const tx = await paystackService.verifyTransaction(reference);
  if (tx.status !== "success") throw new Error("Payment not successful");

  const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
  if (!order) throw new Error("Order not found for this reference");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: PaymentStatus.PAID },
  });

  await fundVendorWallet(order.id, order.totalKobo).catch(() => {});

  // Save card authorization if reusable
  if (tx.authorization?.reusable && userId) {
    const auth = tx.authorization;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
    const email = user?.email ?? `${user?.phone?.replace("+", "")}@pay.godrop.ng`;
    const existing = await prisma.savedCard.findFirst({ where: { userId, last4: auth.last4, expMonth: auth.exp_month, expYear: auth.exp_year } });
    if (!existing) {
      const isDefault = (await prisma.savedCard.count({ where: { userId } })) === 0;
      await prisma.savedCard.create({
        data: { userId, authorizationCode: auth.authorization_code, cardType: auth.card_type, last4: auth.last4, expMonth: auth.exp_month, expYear: auth.exp_year, bank: auth.bank, email, isDefault },
      });
    }
  }

  return { status: "paid", order: updated };
}
