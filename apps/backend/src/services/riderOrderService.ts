import { prisma } from "../lib/prisma";
import { Order, OrderStatus, OrderType, PaymentStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { broadcastTracking } from "../index";
import { createRiderEarning } from "./riderEarningService";
import { sendToCustomerTokens, notifyCustomerOrderUpdate } from "./fcmService";
import * as walletService from "./walletService";

const RIDER_EARNING_RATE = parseFloat(process.env.RIDER_EARNING_RATE || "0.8");

export async function listAvailableOrders(opts: { page: number; limit: number; type?: OrderType }) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { riderId: null, status: "READY_FOR_PICKUP", type: { not: OrderType.TRUCK } };
  if (opts.type) where.type = opts.type;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingCode: true,
        type: true,
        status: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupLat: true,
        pickupLng: true,
        dropoffLat: true,
        dropoffLng: true,
        deliveryFeeKobo: true,
        totalKobo: true,
        paymentMethod: true,
        recipientName: true,
        recipientPhone: true,
        createdAt: true,
        vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
        dropoffs: {
          orderBy: { sequence: "asc" },
          select: {
            id: true, sequence: true, address: true, lat: true, lng: true,
            recipientName: true, recipientPhone: true, packageDescription: true,
            weightKg: true, status: true, deliveryFeeKobo: true, earningKobo: true,
            deliveredAt: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function listRiderOrders(
  riderId: string,
  opts: {
    status?: OrderStatus;
    page: number;
    limit: number;
  }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { riderId, type: { not: OrderType.TRUCK } };
  if (opts.status) where.status = opts.status;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingCode: true,
        type: true,
        status: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupLat: true,
        pickupLng: true,
        dropoffLat: true,
        dropoffLng: true,
        deliveryFeeKobo: true,
        totalKobo: true,
        paymentMethod: true,
        recipientName: true,
        recipientPhone: true,
        createdAt: true,
        vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
        dropoffs: {
          orderBy: { sequence: "asc" },
          select: {
            id: true, sequence: true, address: true, lat: true, lng: true,
            recipientName: true, recipientPhone: true, packageDescription: true,
            weightKg: true, status: true, deliveryFeeKobo: true, earningKobo: true,
            deliveredAt: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

// recipientName/recipientPhone are only ever set at order-creation time for
// parcel orders; food/grocery/retail/pharmacy orders leave them null. Fall
// back to the ordering customer's own name/phone so riders always have a way
// to reach whoever they're delivering to.
function withRecipientFallback<
  T extends {
    recipientName: string | null;
    recipientPhone: string | null;
    customer?: { firstName: string | null; lastName: string | null; phone: string } | null;
  }
>(order: T): T {
  const fallbackName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    ...order,
    recipientName: order.recipientName || (fallbackName ? fallbackName : null),
    recipientPhone: order.recipientPhone || order.customer?.phone || null,
  };
}

export async function getActiveOrder(riderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      riderId,
      status: { in: ["ACCEPTED", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT"] },
      type: { not: OrderType.TRUCK },
    },
    include: {
      vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
      customer: { select: { firstName: true, lastName: true, phone: true } },
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      dropoffs: {
        orderBy: { sequence: "asc" },
        select: {
          id: true, sequence: true, address: true, lat: true, lng: true,
          recipientName: true, recipientPhone: true, packageDescription: true,
          weightKg: true, status: true, deliveryFeeKobo: true, earningKobo: true,
          deliveredAt: true, failureReason: true,
        },
      },
    },
  });
  return order ? withRecipientFallback(order) : order;
}

export async function getRiderOrderDetail(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
      customer: { select: { firstName: true, lastName: true, phone: true } },
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      dropoffs: {
        orderBy: { sequence: "asc" },
        select: {
          id: true, sequence: true, address: true, lat: true, lng: true,
          recipientName: true, recipientPhone: true, packageDescription: true,
          weightKg: true, status: true, deliveryFeeKobo: true, earningKobo: true,
          deliveredAt: true, failureReason: true,
        },
      },
    },
  });
  if (!order) throw new Error("Order not found");
  if (order.type === OrderType.TRUCK) throw new Error("Order not found");
  // Allow if: assigned to this rider, OR still available (no rider, READY_FOR_PICKUP)
  const isAssignedToRider = order.riderId === riderId;
  const isAvailableToView = order.riderId === null && order.status === "READY_FOR_PICKUP";
  if (!isAssignedToRider && !isAvailableToView) throw new Error("Order no longer available");

  const withFallback = withRecipientFallback(order);

  if (isAssignedToRider) return withFallback;

  // Still just browsing an unassigned order — don't expose the customer's or
  // recipients' identity until the rider actually commits by accepting.
  return {
    ...withFallback,
    customer: null,
    recipientName: null,
    recipientPhone: null,
    dropoffs: withFallback.dropoffs.map((d) => ({
      ...d,
      recipientName: "Hidden until accepted",
      recipientPhone: "",
    })),
  };
}

export async function acceptOrder(riderId: string, orderId: string) {
  // Block if rider already has an active order
  const activeOrder = await prisma.order.findFirst({
    where: {
      riderId,
      status: { in: ["ACCEPTED", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT"] },
    },
    select: { id: true, trackingCode: true },
  });
  if (activeOrder) {
    throw new Error(`You already have an active order (#${activeOrder.trackingCode}). Complete it before accepting another.`);
  }

  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new Error("Order not found");
    if (existing.type === OrderType.TRUCK) throw new Error("Truck orders cannot be accepted from the rider app");
    if (existing.status !== "READY_FOR_PICKUP") throw new Error("Order is not available for acceptance");

    // Atomic gate: only one rider wins — the WHERE filters riderId IS NULL so concurrent
    // requests that pass the read above will get count=0 once another commits.
    const result = await tx.order.updateMany({
      where: { id: orderId, riderId: null, status: "READY_FOR_PICKUP" },
      data: { riderId, status: "ACCEPTED" },
    });

    if (result.count === 0) throw new Error("Order has already been accepted by another rider");

    await tx.orderEvent.create({
      data: { orderId, status: "ACCEPTED", description: "Rider accepted the order" },
    });

    return tx.order.findUnique({ where: { id: orderId } });
  });

  // Push real-time status update to any open WebSocket connections for this order
  prisma.rider
    .findUnique({ where: { id: riderId }, select: { firstName: true, lastName: true, phone: true } })
    .then((rider) => broadcastTracking(order!.id, { type: "STATUS_UPDATE", status: "ACCEPTED", rider }))
    .catch(() => {});

  // Notify customer outside the transaction — don't block the response on FCM
  notifyCustomerRiderAccepted(order!).catch(() => {});

  return order;
}

async function notifyCustomerRiderAccepted(order: Order) {
  const title = "Rider assigned";
  const body = `A rider has accepted your order #${order.trackingCode} and is heading to pick it up.`;
  const data = { type: "ORDER_ACCEPTED", orderId: order.id, trackingCode: order.trackingCode };

  const tokens = await prisma.pushToken.findMany({
    where: { userId: order.customerId },
    select: { token: true },
  });

  await Promise.all([
    tokens.length > 0
      ? sendToCustomerTokens(tokens.map((t) => t.token), { title, body }, data)
      : Promise.resolve(),
    prisma.notification.create({
      data: { userId: order.customerId, title, body, data },
    }),
  ]);
}

async function notifyCustomerOrderRejected(order: Order) {
  const title = "Finding you another rider";
  const body = `Your rider had to step away from order #${order.trackingCode}. We're finding you another rider now.`;
  const data = { type: "ORDER_REJECTED", orderId: order.id, trackingCode: order.trackingCode };

  const tokens = await prisma.pushToken.findMany({
    where: { userId: order.customerId },
    select: { token: true },
  });

  await Promise.all([
    tokens.length > 0
      ? sendToCustomerTokens(tokens.map((t) => t.token), { title, body }, data)
      : Promise.resolve(),
    prisma.notification.create({
      data: { userId: order.customerId, title, body, data },
    }),
  ]);
}

export async function rejectOrder(riderId: string, orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (order.status !== "ACCEPTED") throw new Error("Order cannot be rejected at this stage");

  await prisma.$transaction([
    prisma.orderEvent.create({
      data: {
        orderId,
        status: order.status,
        description: reason ? `Rider rejected: ${reason}` : "Rider rejected the order",
      },
    }),
    prisma.riderRejection.create({
      data: { riderId, orderId, reason },
    }),
  ]);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { riderId: null, status: "READY_FOR_PICKUP" },
  });

  notifyCustomerOrderRejected(updated).catch(() => {});

  return updated;
}

export async function markPickedUp(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  const allowed = ["ACCEPTED", "READY_FOR_PICKUP"];
  if (!allowed.includes(order.status)) throw new Error("Order cannot be marked as picked up at this stage");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PICKED_UP",
      // Everything is collected at the single pickup — move all parcels along.
      dropoffs: { updateMany: { where: { status: "PENDING" }, data: { status: "PICKED_UP" } } },
    },
  });

  await prisma.orderEvent.create({
    data: { orderId, status: "PICKED_UP", description: "Rider picked up the order" },
  });

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: "PICKED_UP" });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Order picked up",
    `Your order #${order.trackingCode} has been picked up and is on the way.`,
    "ORDER_PICKED_UP"
  ).catch(() => {});

  return updated;
}

export async function markInTransit(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (order.status !== "PICKED_UP") throw new Error("Order must be picked up first");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "IN_TRANSIT" },
  });

  await prisma.orderEvent.create({
    data: { orderId, status: "IN_TRANSIT", description: "Rider is on the way" },
  });

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: "IN_TRANSIT" });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Rider is on the way",
    `Your order #${order.trackingCode} is in transit — the rider is heading to you.`,
    "ORDER_IN_TRANSIT"
  ).catch(() => {});

  return updated;
}

async function getEarningRate(): Promise<number> {
  const platform = await prisma.platformSettings.findUnique({ where: { id: "global" } });
  return platform?.riderEarningRate ?? RIDER_EARNING_RATE;
}

/**
 * After a parcel is resolved (delivered/failed), check whether every parcel in
 * the order is now terminal. If so, close the order: DELIVERED when at least one
 * parcel was delivered, otherwise FAILED. Notifies the customer + broadcasts.
 */
async function finalizeOrderIfComplete(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dropoffs: true },
  });
  if (!order) return;
  if (["DELIVERED", "FAILED", "CANCELLED"].includes(order.status)) return;

  const terminal: OrderStatus[] = ["DELIVERED", "FAILED", "CANCELLED"];
  const allResolved = order.dropoffs.every((d) => terminal.includes(d.status));
  if (!allResolved) return;

  const anyDelivered = order.dropoffs.some((d) => d.status === "DELIVERED");
  const finalStatus: OrderStatus = anyDelivered ? "DELIVERED" : "FAILED";

  await prisma.order.update({ where: { id: orderId }, data: { status: finalStatus } });
  await prisma.orderEvent.create({
    data: {
      orderId,
      status: finalStatus,
      description:
        finalStatus === "DELIVERED"
          ? order.dropoffs.length > 1
            ? "All parcels delivered"
            : "Order delivered"
          : "Order could not be delivered",
    },
  });

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: finalStatus });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    finalStatus === "DELIVERED" ? "Order delivered" : "Delivery unsuccessful",
    finalStatus === "DELIVERED"
      ? `Your order #${order.trackingCode} has been fully delivered. Enjoy!`
      : `We couldn't deliver your order #${order.trackingCode}.`,
    finalStatus === "DELIVERED" ? "ORDER_DELIVERED" : "ORDER_FAILED"
  ).catch(() => {});
}

/**
 * Mark a single parcel within an order as delivered, validating that parcel's
 * own confirmation code. Records a per-parcel rider earning and finalizes the
 * order once every parcel is resolved.
 */
export async function markDropoffDelivered(
  riderId: string,
  orderId: string,
  dropoffId: string,
  confirmationCode: string,
  proofNote?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT"].includes(order.status)) {
    throw new Error("Parcels must be picked up before they can be delivered");
  }

  const dropoff = await prisma.parcelDropoff.findUnique({ where: { id: dropoffId } });
  if (!dropoff || dropoff.orderId !== orderId) throw new Error("Parcel not found");
  if (["DELIVERED", "FAILED", "CANCELLED"].includes(dropoff.status)) {
    throw new Error("This parcel has already been completed");
  }
  if (dropoff.confirmationCode !== confirmationCode) {
    throw new Error("Invalid confirmation code. Ask the recipient for their 4-digit code.");
  }

  const rate = await getEarningRate();
  const earningKobo = Math.floor(dropoff.deliveryFeeKobo * rate);

  const updated = await prisma.parcelDropoff.update({
    where: { id: dropoffId },
    data: { status: "DELIVERED", deliveredAt: new Date(), earningKobo },
  });

  await prisma.orderEvent.create({
    data: {
      orderId,
      status: "DELIVERED",
      description: proofNote
        ? `Parcel ${dropoff.sequence} delivered to ${dropoff.recipientName} — ${proofNote}`
        : `Parcel ${dropoff.sequence} delivered to ${dropoff.recipientName}`,
    },
  });

  await createRiderEarning(riderId, orderId, earningKobo, dropoffId);

  broadcastTracking(orderId, {
    type: "DROPOFF_UPDATE",
    dropoffId,
    sequence: dropoff.sequence,
    status: "DELIVERED",
  });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Parcel delivered",
    `Parcel ${dropoff.sequence} to ${dropoff.recipientName} has been delivered.`,
    "DROPOFF_DELIVERED"
  ).catch(() => {});

  await finalizeOrderIfComplete(orderId);
  return updated;
}

/**
 * Mark a single parcel as failed (no earning). Finalizes the order once every
 * parcel is resolved.
 */
export async function markDropoffFailed(
  riderId: string,
  orderId: string,
  dropoffId: string,
  reason: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT", "ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Cannot fail this parcel at this stage");
  }

  const dropoff = await prisma.parcelDropoff.findUnique({ where: { id: dropoffId } });
  if (!dropoff || dropoff.orderId !== orderId) throw new Error("Parcel not found");
  if (["DELIVERED", "FAILED", "CANCELLED"].includes(dropoff.status)) {
    throw new Error("This parcel has already been completed");
  }

  const updated = await prisma.parcelDropoff.update({
    where: { id: dropoffId },
    data: { status: "FAILED", failureReason: reason },
  });

  await prisma.orderEvent.create({
    data: {
      orderId,
      status: "FAILED",
      description: `Parcel ${dropoff.sequence} to ${dropoff.recipientName} failed: ${reason}`,
    },
  });

  broadcastTracking(orderId, {
    type: "DROPOFF_UPDATE",
    dropoffId,
    sequence: dropoff.sequence,
    status: "FAILED",
  });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Parcel undeliverable",
    `Parcel ${dropoff.sequence} to ${dropoff.recipientName} could not be delivered. Reason: ${reason}`,
    "DROPOFF_FAILED"
  ).catch(() => {});

  await finalizeOrderIfComplete(orderId);
  return updated;
}

/**
 * Order-level "mark delivered" — retained for the legacy rider app. Delivers ALL
 * remaining parcels in one shot using the order confirmation code (which mirrors
 * the last parcel's code), recording a per-parcel earning for each.
 */
export async function markDelivered(
  riderId: string,
  orderId: string,
  confirmationCode: string,
  proofNote?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dropoffs: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT"].includes(order.status)) {
    throw new Error("Order must be in transit or picked up to mark as delivered");
  }
  if (!order.confirmationCode || order.confirmationCode !== confirmationCode) {
    throw new Error("Invalid confirmation code. Ask the customer for their 4-digit code.");
  }

  const rate = await getEarningRate();
  const pending = order.dropoffs.filter(
    (d) => !["DELIVERED", "FAILED", "CANCELLED"].includes(d.status)
  );

  if (pending.length === 0) {
    // Non-parcel order (no dropoffs) — keep original single-earning behaviour.
    const earningKobo = Math.floor(order.deliveryFeeKobo * rate);
    await createRiderEarning(riderId, orderId, earningKobo);
  } else {
    for (const d of pending) {
      const earningKobo = Math.floor(d.deliveryFeeKobo * rate);
      await prisma.parcelDropoff.update({
        where: { id: d.id },
        data: { status: "DELIVERED", deliveredAt: new Date(), earningKobo },
      });
      await createRiderEarning(riderId, orderId, earningKobo, d.id);
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "DELIVERED" },
  });
  await prisma.orderEvent.create({
    data: {
      orderId,
      status: "DELIVERED",
      description: proofNote ? `Delivered — ${proofNote}` : "Order delivered",
    },
  });

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: "DELIVERED" });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Order delivered",
    `Your order #${order.trackingCode} has been delivered. Enjoy!`,
    "ORDER_DELIVERED"
  ).catch(() => {});

  return updated;
}

export async function markFailed(riderId: string, orderId: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT", "ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Cannot mark this order as failed");
  }

  // The rider has already accepted (and possibly picked up) this order, so
  // abandoning it now must refund the customer in full — same rule as a
  // customer/vendor cancellation, just reachable at a later order stage.
  const isRefundable = order.paymentStatus === PaymentStatus.PAID;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "FAILED",
      cancellationReason: reason,
      ...(isRefundable ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
      dropoffs: {
        updateMany: {
          where: { status: { notIn: ["DELIVERED", "FAILED", "CANCELLED"] } },
          data: { status: "FAILED", failureReason: reason },
        },
      },
    },
  });

  if (isRefundable) {
    await walletService.credit(
      order.customerId,
      order.totalKobo,
      `Refund for undelivered order #${order.trackingCode}`,
      `REFUND-${order.id}`
    );
  }

  await prisma.orderEvent.create({
    data: { orderId, status: "FAILED", description: `Delivery failed: ${reason}` },
  });

  broadcastTracking(orderId, { type: "STATUS_UPDATE", status: "FAILED" });
  notifyCustomerOrderUpdate(
    order.customerId, orderId, order.trackingCode,
    "Delivery unsuccessful",
    isRefundable
      ? `We couldn't deliver your order #${order.trackingCode}. Reason: ${reason}. The full amount has been refunded to your wallet.`
      : `We couldn't deliver your order #${order.trackingCode}. Reason: ${reason}.`,
    "ORDER_FAILED"
  ).catch(() => {});

  return updated;
}

export async function pushLocationUpdate(riderId: string, orderId: string, lat: number, lng: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");

  await prisma.rider.update({ where: { id: riderId }, data: { lat, lng } });

  broadcastTracking(orderId, { lat, lng, updatedAt: new Date().toISOString() });
}
