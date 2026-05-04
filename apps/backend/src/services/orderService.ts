import { prisma } from "../lib/prisma";
import { OrderStatus, OrderType, PaymentMethod } from "@prisma/client";
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { paginate } from "../utils/pagination";
import * as pricingService from "./pricingService";
import * as fcmService from "./fcmService";

export async function listOrders(
  customerId: string,
  opts: { status?: string; type?: string; page?: number; limit?: number }
) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = { customerId };
  if (opts.status) where.status = opts.status.toUpperCase();
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
      rider: true,
    },
  });
  return order;
}

export async function cancelOrder(id: string, customerId: string, reason?: string) {
  const order = await prisma.order.findFirst({ where: { id, customerId } });
  if (!order) return null;

  const cancellableStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
  ];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      events: {
        create: { status: OrderStatus.CANCELLED, description: reason ?? "Cancelled by customer" },
      },
    },
  });

  return updated;
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

  return prisma.review.create({
    data: {
      orderId,
      userId: customerId,
      vendorId: order.vendorId ?? undefined,
      rating,
      comment,
    },
  });
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

  const order = await prisma.order.create({
    data: {
      trackingCode,
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
      events: { create: { status: OrderStatus.PENDING, description: "Parcel order placed" } },
    },
    include: { parcelVehicleType: { select: { id: true, name: true } } },
  });

  // Notify all online riders via FCM (fire-and-forget)
  fcmService.notifyOnlineRidersNewParcel({
    id: order.id,
    trackingCode: order.trackingCode,
    pickupAddress: order.pickupAddress,
    dropoffAddress: order.dropoffAddress,
    totalKobo: order.totalKobo,
  }).catch((err) => console.error("FCM notify failed:", err));

  return order;
}

export async function placeTruckOrder(
  customerId: string,
  data: {
    apartmentTypeId: string;
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
      totalKobo: number;
    };
    estimatedMinutes: number;
  }
) {
  const trackingCode = generateTrackingCode();
  return prisma.order.create({
    data: {
      trackingCode,
      customerId,
      type: OrderType.TRUCK,
      status: OrderStatus.PENDING,
      apartmentTypeId: data.apartmentTypeId,
      numLoaders: data.numLoaders,
      pickupAddress: data.pickup.address,
      pickupLat: data.pickup.lat,
      pickupLng: data.pickup.lng,
      dropoffAddress: data.dropoff.address,
      dropoffLat: data.dropoff.lat,
      dropoffLng: data.dropoff.lng,
      stops: data.stops ?? [],
      paymentMethod: data.paymentMethod.toUpperCase() as PaymentMethod,
      subtotalKobo: data.priceBreakdown.apartmentCostKobo,
      deliveryFeeKobo: data.priceBreakdown.kmCostKobo + data.priceBreakdown.loadersCostKobo,
      totalKobo: data.priceBreakdown.totalKobo,
      estimatedMinutes: data.estimatedMinutes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      notes: data.notes,
      events: { create: { status: OrderStatus.PENDING, description: "Truck booking placed" } },
    },
    include: { apartmentType: true },
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
  if (opts.status) where.status = opts.status.toUpperCase();
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
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const terminal: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED];
  if (terminal.includes(order.status)) {
    throw new Error("Order is already in a terminal state");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
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
    riderLat: order.rider?.lat ?? null,
    riderLng: order.rider?.lng ?? null,
  };
}
