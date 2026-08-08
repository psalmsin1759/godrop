import { prisma } from "../lib/prisma";
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { generateConfirmationCode } from "../utils/generateConfirmationCode";
import { paginate } from "../utils/pagination";
import * as pricingService from "./pricingService";
import * as fcmService from "./fcmService";
import * as walletService from "./walletService";
import * as promotionService from "./promotionService";
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

// Delivered + cancelled + failed orders, combined into a single paginated
// "history" bucket so clients don't have to merge two separate queries.
const HISTORY_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.FAILED,
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
    const upperStatus = opts.status.toUpperCase();
    if (upperStatus === "ACTIVE") {
      where.status = { in: ACTIVE_STATUSES };
    } else if (upperStatus === "HISTORY") {
      where.status = { in: HISTORY_STATUSES };
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
      include: { dropoffs: { orderBy: { sequence: "asc" } } },
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
      dropoffs: { orderBy: { sequence: "asc" } },
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

interface ParcelItemInput {
  dropoff: { lat: number; lng: number; address: string };
  recipientName: string;
  recipientPhone: string;
  packageDescription?: string;
  weightKg?: number;
  sizeCategory?: string;
}

export async function placeParcelOrder(
  customerId: string,
  data: {
    pickup: { lat: number; lng: number; address: string };
    vehicleTypeId?: string;
    paymentMethod: string;
    scheduleAt?: string;
    // New multi-parcel shape:
    parcels?: ParcelItemInput[];
    // Legacy single-parcel shape:
    dropoff?: { lat: number; lng: number; address: string };
    packageDescription?: string;
    weightKg?: number;
    sizeCategory?: string;
    recipientName?: string;
    recipientPhone?: string;
    couponCode?: string;
  }
) {
  // Normalize the legacy single-parcel body into a 1-element `parcels` array.
  const parcels: ParcelItemInput[] =
    data.parcels && data.parcels.length > 0
      ? data.parcels
      : [
          {
            dropoff: data.dropoff!,
            recipientName: data.recipientName!,
            recipientPhone: data.recipientPhone!,
            packageDescription: data.packageDescription,
            weightKg: data.weightKg,
            sizeCategory: data.sizeCategory,
          },
        ];

  let vehicleType: { id: string; baseFeeKobo: number; perKmKobo: number } | null = null;
  if (data.vehicleTypeId) {
    vehicleType = await prisma.parcelVehicleType.findFirst({
      where: { id: data.vehicleTypeId, isActive: true },
      select: { id: true, baseFeeKobo: true, perKmKobo: true },
    });
    if (!vehicleType) throw new Error("Vehicle type not found or inactive");
  }

  const quote = pricingService.parcelQuoteMulti(
    data.pickup,
    parcels.map((p) => p.dropoff),
    vehicleType ?? undefined
  );

  // Coupon discounts the delivery fee only — the per-dropoff deliveryFeeKobo
  // riders are paid from (below) stays undiscounted; the reduction is applied
  // only to the order's totalKobo.
  let discountKobo = 0;
  let promotionId: string | undefined;
  if (data.couponCode) {
    const promo = await promotionService.applyPromoCode({
      code: data.couponCode,
      orderType: OrderType.PARCEL,
      deliveryFeeKobo: quote.priceBreakdown.deliveryFeeKobo,
      orderValueKobo: quote.priceBreakdown.totalKobo,
    });
    discountKobo = promo.discountKobo;
    promotionId = promo.promotionId;
  }

  const trackingCode = generateTrackingCode();
  // Pre-generate a confirmation code per parcel. The order-level dropoff/recipient
  // fields (and confirmationCode) mirror the LAST parcel as a summary so existing
  // single-destination readers (tracking, dashboard, legacy rider app) keep working.
  const parcelCodes = parcels.map(() => generateConfirmationCode());
  const last = parcels[parcels.length - 1];

  const order = await prisma.order.create({
    data: {
      trackingCode,
      confirmationCode: parcelCodes[parcelCodes.length - 1],
      customerId,
      type: OrderType.PARCEL,
      status: OrderStatus.PENDING,
      pickupAddress: data.pickup.address,
      pickupLat: data.pickup.lat,
      pickupLng: data.pickup.lng,
      dropoffAddress: last.dropoff.address,
      dropoffLat: last.dropoff.lat,
      dropoffLng: last.dropoff.lng,
      parcelVehicleTypeId: vehicleType?.id,
      packageDescription: last.packageDescription,
      weightKg: last.weightKg,
      sizeCategory: last.sizeCategory,
      recipientName: last.recipientName,
      recipientPhone: last.recipientPhone,
      paymentMethod: data.paymentMethod.toUpperCase() as PaymentMethod,
      deliveryFeeKobo: quote.priceBreakdown.deliveryFeeKobo,
      serviceFeeKobo: quote.priceBreakdown.serviceFeeKobo,
      discountKobo,
      promotionId,
      totalKobo: quote.priceBreakdown.totalKobo - discountKobo,
      estimatedMinutes: quote.estimatedMinutes,
      scheduledAt: data.scheduleAt ? new Date(data.scheduleAt) : undefined,
      events: { create: { status: OrderStatus.PENDING, description: "Parcel order placed — awaiting payment" } },
      dropoffs: {
        create: parcels.map((p, i) => ({
          sequence: i + 1,
          address: p.dropoff.address,
          lat: p.dropoff.lat,
          lng: p.dropoff.lng,
          recipientName: p.recipientName,
          recipientPhone: p.recipientPhone,
          packageDescription: p.packageDescription,
          weightKg: p.weightKg,
          sizeCategory: p.sizeCategory,
          confirmationCode: parcelCodes[i],
          deliveryFeeKobo: quote.parcels[i].deliveryFeeKobo,
          distanceKm: quote.parcels[i].distanceKm,
        })),
      },
    },
    include: {
      parcelVehicleType: { select: { id: true, name: true } },
      dropoffs: { orderBy: { sequence: "asc" } },
    },
  });

  if (promotionId) {
    promotionService.incrementPromotionUsage(promotionId).catch((err) =>
      console.error("[promotion] usage increment failed:", err)
    );
  }

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
    include: { dropoffs: { orderBy: { sequence: "asc" } } },
  });

  const parcelCount = updated.dropoffs.length;

  // Notify all online riders via FCM + WebSocket (fire-and-forget)
  fcmService.notifyOnlineRidersNewParcel({
    id: updated.id,
    trackingCode: updated.trackingCode,
    pickupAddress: updated.pickupAddress,
    dropoffAddress: updated.dropoffAddress,
    totalKobo: updated.totalKobo,
    parcelCount,
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
    parcelCount,
    dropoffs: updated.dropoffs.map((d) => ({
      id: d.id,
      sequence: d.sequence,
      address: d.address,
      lat: d.lat,
      lng: d.lng,
      recipientName: d.recipientName,
      recipientPhone: d.recipientPhone,
      packageDescription: d.packageDescription,
      weightKg: d.weightKg,
      status: d.status,
      deliveryFeeKobo: d.deliveryFeeKobo,
    })),
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
    couponCode?: string;
  }
) {
  const trackingCode = generateTrackingCode();
  const confirmationCode = generateConfirmationCode();
  const subtotalKobo = data.priceBreakdown.apartmentCostKobo + data.priceBreakdown.truckCostKobo;
  const deliveryFeeKobo = data.priceBreakdown.kmCostKobo + data.priceBreakdown.loadersCostKobo;

  // Coupon discounts the delivery fee only — deliveryFeeKobo above stays at
  // its original value (riders are paid from it); the reduction is applied
  // only to the order's totalKobo.
  let discountKobo = 0;
  let promotionId: string | undefined;
  if (data.couponCode) {
    const promo = await promotionService.applyPromoCode({
      code: data.couponCode,
      orderType: OrderType.TRUCK,
      deliveryFeeKobo,
      orderValueKobo: data.priceBreakdown.totalKobo,
    });
    discountKobo = promo.discountKobo;
    promotionId = promo.promotionId;
  }

  const order = await prisma.order.create({
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
      subtotalKobo,
      deliveryFeeKobo,
      discountKobo,
      promotionId,
      totalKobo: data.priceBreakdown.totalKobo - discountKobo,
      estimatedMinutes: data.estimatedMinutes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      notes: data.notes,
      events: { create: { status: OrderStatus.READY_FOR_PICKUP, description: "Truck booking placed" } },
    },
    include: { apartmentType: true, truckType: true },
  });

  if (promotionId) {
    promotionService.incrementPromotionUsage(promotionId).catch((err) =>
      console.error("[promotion] usage increment failed:", err)
    );
  }

  return order;
}

export async function listAllOrders(opts: {
  status?: string;
  type?: string;
  customerId?: string;
  vendorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = {};
  if (opts.status) where.status = normalizeStatus(opts.status);
  if (opts.type) where.type = opts.type.toUpperCase();
  if (opts.customerId) where.customerId = opts.customerId;
  if (opts.vendorId) where.vendorId = opts.vendorId;
  if (opts.search) {
    where.OR = [
      { trackingCode: { contains: opts.search, mode: "insensitive" } },
      { paystackRef: { contains: opts.search, mode: "insensitive" } },
      { customer: { is: { firstName: { contains: opts.search, mode: "insensitive" } } } },
      { customer: { is: { lastName: { contains: opts.search, mode: "insensitive" } } } },
      { customer: { is: { phone: { contains: opts.search } } } },
      { vendor: { is: { name: { contains: opts.search, mode: "insensitive" } } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: true,
        dropoffs: { orderBy: { sequence: "asc" } },
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        vendor: { select: { id: true, name: true, type: true } },
      },
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
      dropoffs: { orderBy: { sequence: "asc" }, include: { earning: { select: { amountKobo: true, status: true } } } },
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

  // Cascade terminal states to this order's parcels so per-parcel views stay
  // consistent with an admin override.
  const cascade = terminal.includes(status);

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      events: {
        create: { status, description: note ?? `Status updated to ${status} by admin` },
      },
      ...(cascade
        ? { dropoffs: { updateMany: { where: { status: { notIn: terminal } }, data: { status } } } }
        : {}),
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      dropoffs: { orderBy: { sequence: "asc" } },
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
      dropoffs: {
        updateMany: {
          where: { status: { notIn: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.CANCELLED] } },
          data: { status: OrderStatus.CANCELLED },
        },
      },
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      dropoffs: { orderBy: { sequence: "asc" } },
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
    include: { rider: true, dropoffs: { orderBy: { sequence: "asc" } } },
  });
  if (!order) return null;
  return {
    status: order.status,
    estimatedMinutes: order.estimatedMinutes,
    confirmationCode: order.confirmationCode,
    riderLat: order.rider?.lat ?? null,
    riderLng: order.rider?.lng ?? null,
    pickupLat: order.pickupLat,
    pickupLng: order.pickupLng,
    dropoffs: order.dropoffs.map((d) => ({
      id: d.id,
      sequence: d.sequence,
      address: d.address,
      lat: d.lat,
      lng: d.lng,
      recipientName: d.recipientName,
      recipientPhone: d.recipientPhone,
      packageDescription: d.packageDescription,
      weightKg: d.weightKg,
      status: d.status,
      confirmationCode: d.confirmationCode,
      deliveryFeeKobo: d.deliveryFeeKobo,
      deliveredAt: d.deliveredAt,
    })),
  };
}
