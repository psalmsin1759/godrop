import { prisma } from "../lib/prisma";
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { generateConfirmationCode } from "../utils/generateConfirmationCode";
import { paginate } from "../utils/pagination";
import * as pricingService from "./pricingService";
import * as fcmService from "./fcmService";
import * as walletService from "./walletService";
import { sendEmail, customerOrderCancelledEmail } from "./emailService";
import { broadcastNewOrder } from "../index";

const STATUS_ALIASES: Record<string, OrderStatus> = {
  COMPLETED: OrderStatus.DELIVERED,
  DONE:      OrderStatus.DELIVERED,
};

const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
];

function normalizeStatus(raw: string): OrderStatus {
  const upper = raw.toUpperCase() as OrderStatus;
  return STATUS_ALIASES[upper] ?? upper;
}

export async function listOrders(
  customerId: string,
  opts: { status?: string; type?: string; page?: number; limit?: number }
) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = { customerId };
  if (opts.status) {
    if (opts.status.toUpperCase() === "ACTIVE") {
      where.status = { in: ACTIVE_STATUSES };
    } else {
      where.status = normalizeStatus(opts.status);
    }
  }
  if (opts.type) where.type = opts.type.toUpperCase();

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getOrder(id: string, customerId: string) {
  const order = await prisma.order.findFirst({
    where: { id, customerId },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      rider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          vehicleType: true,
          vehiclePlate: true,
          rating: true,
          lat: true,
          lng: true,
        },
      },
    },
  });
  return order;
}

export async function cancelOrder(id: string, customerId: string, reason?: string) {
  const order = await prisma.order.findFirst({
    where: { id, customerId },
    include: { customer: true },
  });
  if (!order) return null;

  const cancellableStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
  ];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage");
  }

  const isRefundable = order.paymentStatus === PaymentStatus.PAID;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      ...(isRefundable ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
      events: {
        create: { status: OrderStatus.CANCELLED, description: reason ?? "Cancelled by customer" },
      },
    },
  });

  if (isRefundable) {
    await walletService.credit(
      customerId,
      order.totalKobo,
      `Refund for cancelled order #${order.trackingCode}`,
      order.id
    );
  }

  if (order.customer.email) {
    sendEmail(
      customerOrderCancelledEmail({
        firstName: order.customer.firstName ?? "there",
        email: order.customer.email,
        trackingCode: order.trackingCode,
        totalKobo: order.totalKobo,
        reason,
        refunded: isRefundable,
      })
    ).catch((err) => console.error("Failed to send order cancellation email:", err));
  }

  // Notify the assigned rider if there was one
  if (order.riderId) {
    notifyRiderOrderCancelled(order.riderId, order).catch(() => {});
  }

  return updated;
}

async function notifyRiderOrderCancelled(
  riderId: string,
  order: { id: string; trackingCode: string }
) {
  const title = "Order Cancelled";
  const body = `Order #${order.trackingCode} was cancelled by the customer.`;
  const data = { type: "ORDER_CANCELLED", orderId: order.id, trackingCode: order.trackingCode };

  const tokens = await prisma.riderPushToken.findMany({
    where: { riderId },
    select: { token: true },
  });

  await Promise.all([
    tokens.length > 0
      ? fcmService.sendToRiderTokens(tokens.map((t) => t.token), { title, body }, data)
      : Promise.resolve(),
    prisma.riderNotification.create({
      data: { riderId, title, body, data },
    }),
  ]);
}

export async function rateOrder(
  orderId: string,
  customerId: string,
  rating: number,
  comment?: string
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId, status: OrderStatus.DELIVERED },
  });
  if (!order) throw new Error("Order not found or not delivered");

  const { review, updatedRider } = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        orderId,
        userId: customerId,
        vendorId: order.vendorId ?? undefined,
        riderId: order.riderId ?? undefined,
        rating,
        comment,
      },
    });

    let updatedRider = null;
    if (order.riderId) {
      const rider = await tx.rider.findUnique({
        where: { id: order.riderId },
        select: { rating: true, ratingCount: true },
      });
      const newCount = (rider?.ratingCount ?? 0) + 1;
      const newRating = ((rider?.rating ?? 0) * (rider?.ratingCount ?? 0) + rating) / newCount;
      updatedRider = await tx.rider.update({
        where: { id: order.riderId },
        data: { rating: newRating, ratingCount: newCount },
        select: { id: true, rating: true, ratingCount: true },
      });
    }

    return { review, updatedRider };
  });

  if (updatedRider) {
    fcmService
      .notifyRiderRated(updatedRider.id, rating, updatedRider.rating, updatedRider.ratingCount)
      .catch(() => {});
  }

  return review;
}

export async function reorder(orderId: string, customerId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return null;

  // Return a cart-like structure for the mobile app to pre-fill
  return {
    vendorId: order.vendorId,
    type: order.type,
    pickupAddress: order.pickupAddress,
    pickupLat: order.pickupLat,
    pickupLng: order.pickupLng,
    dropoffAddress: order.dropoffAddress,
    dropoffLat: order.dropoffLat,
    dropoffLng: order.dropoffLng,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPriceKobo: item.unitPriceKobo,
    })),
  };
}

export async function placeParcelOrder(
  customerId: string,
  data: {
    pickup: { lat: number; lng: number; address: string };
    dropoff: { lat: number; lng: number; address: string };
    vehicleTypeId?: string;
    packageDescription: string;
    weightKg?: number;
    sizeCategory?: string;
    paymentMethod: string;
    recipientName: string;
    recipientPhone: string;
    scheduleAt?: string;
  }
) {
  let vehicleType: { id: string; baseFeeKobo: number; perKmKobo: number } | null = null;
  if (data.vehicleTypeId) {
    vehicleType = await prisma.parcelVehicleType.findFirst({
      where: { id: data.vehicleTypeId, isActive: true },
      select: { id: true, baseFeeKobo: true, perKmKobo: true },
    });
    if (!vehicleType) throw new Error("Vehicle type not found or inactive");
  }

  const { priceBreakdown, estimatedMinutes } = pricingService.parcelQuote(
    data.pickup,
    data.dropoff,
    vehicleType ?? undefined
  );
  const trackingCode = generateTrackingCode();
  const confirmationCode = generateConfirmationCode();

  const order = await prisma.order.create({
    data: {
      trackingCode,
      confirmationCode,
      customerId,
      type: OrderType.PARCEL,
      status: OrderStatus.PENDING,
      pickupAddress: data.pickup.address,
      pickupLat: data.pickup.lat,
      pickupLng: data.pickup.lng,
      dropoffAddress: data.dropoff.address,
      dropoffLat: data.dropoff.lat,
      dropoffLng: data.dropoff.lng,
      parcelVehicleTypeId: vehicleType?.id,
      packageDescription: data.packageDescription,
      weightKg: data.weightKg,
      sizeCategory: data.sizeCategory,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      paymentMethod: data.paymentMethod.toUpperCase() as PaymentMethod,
      deliveryFeeKobo: priceBreakdown.deliveryFeeKobo,
      serviceFeeKobo: priceBreakdown.serviceFeeKobo,
      totalKobo: priceBreakdown.totalKobo,
      estimatedMinutes,
      scheduledAt: data.scheduleAt ? new Date(data.scheduleAt) : undefined,
      events: { create: { status: OrderStatus.PENDING, description: "Parcel order placed — awaiting payment" } },
    },
    include: { parcelVehicleType: { select: { id: true, name: true } } },
  });

  // Not yet visible to riders or broadcast — that happens once payment is
  // confirmed, via activateOrderAfterPayment().
  return order;
}

/**
 * Promotes a PENDING parcel order to READY_FOR_PICKUP once payment has been
 * confirmed (or for payment methods that don't require upfront online
 * payment, e.g. cash), and only then surfaces it to riders via FCM +
 * WebSocket. This ensures riders never see — and can't accept — an order the
 * customer hasn't actually paid for.
 */
export async function activateOrderAfterPayment(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.type !== OrderType.PARCEL || order.status !== OrderStatus.PENDING) return;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.READY_FOR_PICKUP,
      events: { create: { status: OrderStatus.READY_FOR_PICKUP, description: "Payment confirmed — order ready for pickup" } },
    },
  });

  // Notify all online riders via FCM + WebSocket (fire-and-forget)
  fcmService.notifyOnlineRidersNewParcel({
    id: updated.id,
    trackingCode: updated.trackingCode,
    pickupAddress: updated.pickupAddress,
    dropoffAddress: updated.dropoffAddress,
    totalKobo: updated.totalKobo,
  }).catch((err) => console.error("FCM notify failed:", err));

  // WebSocket payload must match the RiderOrder model on the mobile app
  broadcastNewOrder({
    id: updated.id,
    trackingCode: updated.trackingCode,
    type: updated.type,
    status: updated.status,
    pickupAddress: updated.pickupAddress,
    pickupLat: updated.pickupLat,
    pickupLng: updated.pickupLng,
    dropoffAddress: updated.dropoffAddress,
    dropoffLat: updated.dropoffLat,
    dropoffLng: updated.dropoffLng,
    deliveryFeeKobo: updated.deliveryFeeKobo,
    totalKobo: updated.totalKobo,
    paymentMethod: updated.paymentMethod,
    recipientName: updated.recipientName ?? null,
    recipientPhone: updated.recipientPhone ?? null,
    vendor: null,
    createdAt: updated.createdAt.toISOString(),
  });
}

export async function placeTruckOrder(
  customerId: string,
  data: {
    apartmentTypeId: string;
    truckTypeId?: string;
    numLoaders: number;
    pickup: { lat: number; lng: number; address: string };
    dropoff: { lat: number; lng: number; address: string };
    stops?: { lat: number; lng: number; address: string }[];
    scheduledAt?: string;
    paymentMethod: string;
    notes?: string;
    priceBreakdown: {
      apartmentCostKobo: number;
      kmCostKobo: number;
      loadersCostKobo: number;
      truckCostKobo: number;
      totalKobo: number;
    };
    estimatedMinutes: number;
  }
) {
  const trackingCode = generateTrackingCode();
  const confirmationCode = generateConfirmationCode();
  return prisma.order.create({
    data: {
      trackingCode,
      confirmationCode,
      customerId,
      type: OrderType.TRUCK,
      status: OrderStatus.READY_FOR_PICKUP,
      apartmentTypeId: data.apartmentTypeId,
      truckTypeId: data.truckTypeId,
      numLoaders: data.numLoaders,
      pickupAddress: data.pickup.address,
      pickupLat: data.pickup.lat,
      pickupLng: data.pickup.lng,
      dropoffAddress: data.dropoff.address,
      dropoffLat: data.dropoff.lat,
      dropoffLng: data.dropoff.lng,
      stops: data.stops ?? [],
      paymentMethod: data.paymentMethod.toUpperCase() as PaymentMethod,
      subtotalKobo: data.priceBreakdown.apartmentCostKobo + data.priceBreakdown.truckCostKobo,
      deliveryFeeKobo: data.priceBreakdown.kmCostKobo + data.priceBreakdown.loadersCostKobo,
      totalKobo: data.priceBreakdown.totalKobo,
      estimatedMinutes: data.estimatedMinutes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      notes: data.notes,
      events: { create: { status: OrderStatus.READY_FOR_PICKUP, description: "Truck booking placed" } },
    },
    include: { apartmentType: true, truckType: true },
  });
}

export async function listAllOrders(opts: {
  status?: string;
  type?: string;
  customerId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = normalizeStatus(opts.status);
  if (opts.type) where.type = opts.type.toUpperCase();
  if (opts.customerId) where.customerId = opts.customerId;
  if (opts.vendorId) where.vendorId = opts.vendorId;

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getAnyOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      rider: { select: { id: true, firstName: true, lastName: true, phone: true, lat: true, lng: true } },
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      vendor: { select: { id: true, name: true, type: true } },
      apartmentType: true,
    },
  });
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const terminal: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED];
  if (terminal.includes(order.status)) {
    throw new Error("Cannot update an order in a terminal state");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      events: {
        create: { status, description: note ?? `Status updated to ${status} by admin` },
      },
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      rider: { select: { id: true, firstName: true, lastName: true, phone: true, lat: true, lng: true } },
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      vendor: { select: { id: true, name: true, type: true } },
      apartmentType: true,
    },
  });
}

export async function adminCancelOrder(orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
  if (!order) return null;

  const terminal: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED];
  if (terminal.includes(order.status)) {
    throw new Error("Order is already in a terminal state");
  }

  const isRefundable = order.paymentStatus === PaymentStatus.PAID;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      ...(isRefundable ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
      events: {
        create: { status: OrderStatus.CANCELLED, description: reason ?? "Force-cancelled by admin" },
      },
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      rider: { select: { id: true, firstName: true, lastName: true, phone: true, lat: true, lng: true } },
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      vendor: { select: { id: true, name: true, type: true } },
      apartmentType: true,
    },
  });

  if (isRefundable) {
    await walletService.credit(
      order.customerId,
      order.totalKobo,
      `Refund for cancelled order #${order.trackingCode}`,
      order.id
    );
  }

  if (order.customer.email) {
    sendEmail(
      customerOrderCancelledEmail({
        firstName: order.customer.firstName ?? "there",
        email: order.customer.email,
        trackingCode: order.trackingCode,
        totalKobo: order.totalKobo,
        reason,
        refunded: isRefundable,
      })
    ).catch((err) => console.error("Failed to send order cancellation email:", err));
  }

  if (order.riderId) {
    notifyRiderOrderCancelled(order.riderId, order).catch(() => {});
  }

  return updated;
}

export async function getTracking(orderId: string, customerId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: { rider: true },
  });
  if (!order) return null;
  return {
    status: order.status,
    estimatedMinutes: order.estimatedMinutes,
    confirmationCode: order.confirmationCode,
    riderLat: order.rider?.lat ?? null,
    riderLng: order.rider?.lng ?? null,
  };
}
