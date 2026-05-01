import { prisma } from "../lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import * as paystackService from "./paystackService";
import * as walletService from "./walletService";
import { nanoid } from "nanoid";

export async function initializePayment(userId: string, orderId: string, method: string) {
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
    return { method: "wallet", reference: orderId };
  }

  if (m === PaymentMethod.CASH) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: m },
    });
    return { method: "cash", reference: null };
  }

  // Card — initialize Paystack
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const reference = `GDO-${nanoid(16)}`;
  const result = await paystackService.initializeTransaction({
    email: user.email ?? `${user.phone.replace("+", "")}@pay.godrop.ng`,
    amountKobo: order.totalKobo,
    reference,
    metadata: { orderId, userId, type: "order_payment" },
  });

  await prisma.order.update({ where: { id: orderId }, data: { paystackRef: reference } });

  return { paystackAuthUrl: result.authorizationUrl, reference, method: "card" };
}

export async function verifyPayment(reference: string) {
  const tx = await paystackService.verifyTransaction(reference);
  if (tx.status !== "success") throw new Error("Payment not successful");

  const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
  if (!order) throw new Error("Order not found for this reference");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: PaymentStatus.PAID },
  });

  return { status: "paid", order: updated };
}
