import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";
import { paginate } from "../utils/pagination";
import { broadcastTracking } from "../index";
import { createRiderEarning } from "./riderEarningService";

const RIDER_EARNING_RATE = parseFloat(process.env.RIDER_EARNING_RATE || "0.8");

export async function listRiderOrders(
  riderId: string,
  opts: {
    status?: OrderStatus;
    page: number;
    limit: number;
  }
) {
  const { skip } = paginate(opts.page, opts.limit);
  const where: any = { riderId };
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
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getActiveOrder(riderId: string) {
  return prisma.order.findFirst({
    where: {
      riderId,
      status: { in: ["ACCEPTED", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT"] },
    },
    include: {
      vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
      items: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getRiderOrderDetail(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      vendor: { select: { id: true, name: true, logoUrl: true, address: true, lat: true, lng: true } },
      items: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  return order;
}

export async function acceptOrder(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Order cannot be accepted at this stage");
  }

  await prisma.orderEvent.create({
    data: { orderId, status: order.status, description: "Rider accepted the order" },
  });

  return prisma.order.findUnique({ where: { id: orderId } });
}

export async function rejectOrder(riderId: string, orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Order cannot be rejected at this stage");
  }

  await prisma.orderEvent.create({
    data: {
      orderId,
      status: order.status,
      description: reason ? `Rider rejected: ${reason}` : "Rider rejected the order",
    },
  });

  return prisma.order.update({
    where: { id: orderId },
    data: { riderId: null },
  });
}

export async function markPickedUp(riderId: string, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  const allowed = ["ACCEPTED", "READY_FOR_PICKUP"];
  if (!allowed.includes(order.status)) throw new Error("Order cannot be marked as picked up at this stage");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PICKED_UP" },
  });

  await prisma.orderEvent.create({
    data: { orderId, status: "PICKED_UP", description: "Rider picked up the order" },
  });

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

  return updated;
}

export async function markDelivered(riderId: string, orderId: string, proofNote?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT"].includes(order.status)) {
    throw new Error("Order must be in transit or picked up to mark as delivered");
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

  const earningKobo = Math.floor(order.deliveryFeeKobo * RIDER_EARNING_RATE);
  await createRiderEarning(riderId, orderId, earningKobo);

  return updated;
}

export async function markFailed(riderId: string, orderId: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");
  if (!["PICKED_UP", "IN_TRANSIT", "ACCEPTED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new Error("Cannot mark this order as failed");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "FAILED", cancellationReason: reason },
  });

  await prisma.orderEvent.create({
    data: { orderId, status: "FAILED", description: `Delivery failed: ${reason}` },
  });

  return updated;
}

export async function pushLocationUpdate(riderId: string, orderId: string, lat: number, lng: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.riderId !== riderId) throw new Error("Order not found");

  await prisma.rider.update({ where: { id: riderId }, data: { lat, lng } });

  broadcastTracking(orderId, { lat, lng, updatedAt: new Date().toISOString() });
}
