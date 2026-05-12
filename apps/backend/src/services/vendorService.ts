import { prisma } from "../lib/prisma";
import { VendorType, VendorStatus, OrderType, PaymentMethod } from "@prisma/client";
import { haversineKm } from "../utils/distance";
import { paginate } from "../utils/pagination";
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { sendEmail, vendorNewOrderEmail } from "./emailService";

async function getCoverageRadiusKm(): Promise<number> {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "global" } });
  return settings?.coverageRadiusKm ?? 15;
}

async function listByType(
  type: VendorType,
  opts: {
    lat?: number;
    lng?: number;
    page?: number;
    limit?: number;
    search?: string;
    isOpen?: boolean;
  }
) {
  const { page, limit, skip } = paginate(opts.page, opts.limit);
  const where: any = { type, isActive: true, status: VendorStatus.APPROVED };
  if (opts.search) where.name = { contains: opts.search, mode: "insensitive" };
  if (opts.isOpen !== undefined) where.isOpen = opts.isOpen;

  let [vendors, total] = await prisma.$transaction([
    prisma.vendor.findMany({ where, skip, take: limit }),
    prisma.vendor.count({ where }),
  ]);

  // Filter and sort by distance if coordinates provided
  if (opts.lat !== undefined && opts.lng !== undefined) {
    const radiusKm = await getCoverageRadiusKm();
    vendors = vendors
      .map((v) => ({ ...v, distanceKm: haversineKm(opts.lat!, opts.lng!, v.lat, v.lng) }))
      .filter((v) => v.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    total = vendors.length;
  }

  return { data: vendors, total, page, limit };
}

export async function listRestaurants(opts: Parameters<typeof listByType>[1]) {
  return listByType(VendorType.RESTAURANT, opts);
}

export async function listGroceryStores(opts: Parameters<typeof listByType>[1]) {
  return listByType(VendorType.GROCERY, opts);
}

export async function listRetailStores(opts: Parameters<typeof listByType>[1] & { categoryId?: string }) {
  return listByType(VendorType.RETAIL, opts);
}

export async function listPharmacies(opts: Parameters<typeof listByType>[1]) {
  return listByType(VendorType.PHARMACY, opts);
}

export async function getVendorWithCategories(id: string) {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      categories: {
        where: { isActive: true },
        include: { products: false },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getMenuItems(vendorId: string, categoryId?: string) {
  const where: any = {
    category: { vendorId, isActive: true },
    isAvailable: true,
  };
  if (categoryId) where.categoryId = categoryId;
  return prisma.product.findMany({ where, include: { category: true } });
}

export async function getVendorReviews(vendorId: string, page: number, limit: number) {
  const { skip } = paginate(page, limit);
  const [data, total, aggregate] = await prisma.$transaction([
    prisma.review.findMany({
      where: { vendorId },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { vendorId } }),
    prisma.review.aggregate({ where: { vendorId }, _avg: { rating: true } }),
  ]);
  return { data, total, averageRating: aggregate._avg.rating ?? 0, page, limit };
}

export async function searchVendors(type: VendorType, q: string, lat?: number, lng?: number) {
  const vendors = await prisma.vendor.findMany({
    where: {
      type,
      isActive: true,
      status: VendorStatus.APPROVED,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  const products = await prisma.product.findMany({
    where: {
      category: { vendor: { type } },
      OR: [{ name: { contains: q, mode: "insensitive" } }],
      isAvailable: true,
    },
    include: { category: { include: { vendor: true } } },
  });

  return { vendors, products };
}

export async function listRetailCategories() {
  // Distinct categories across retail vendors — in a real app these would be a separate model
  const vendors = await prisma.vendor.findMany({ where: { type: VendorType.RETAIL, isActive: true } });
  const categoryNames = [...new Set(vendors.flatMap((v) => v.cuisines))];
  return categoryNames.map((name, i) => ({ id: String(i + 1), name }));
}

interface FoodOrderInput {
  userId: string;
  vendorId: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: string;
  paymentMethod: string;
}

async function createVendorOrder(
  input: FoodOrderInput,
  type: OrderType
) {
  const { userId, vendorId, items, deliveryAddress, paymentMethod } = input;

  // Fetch the vendor to use as pickup address
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new Error("Vendor not found");

  // Fetch all products to compute prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotalKobo = 0;
  const orderItemsData = items.map((i) => {
    const product = productMap.get(i.productId);
    if (!product) throw new Error(`Product ${i.productId} not found`);
    const totalKobo = product.priceKobo * i.quantity;
    subtotalKobo += totalKobo;
    return {
      productId: product.id,
      name: product.name,
      unitPriceKobo: product.priceKobo,
      quantity: i.quantity,
      totalKobo,
    };
  });

  const deliveryFeeKobo = vendor.deliveryFeeKobo ?? 75000;
  const serviceFeeKobo = 25000;
  const totalKobo = subtotalKobo + deliveryFeeKobo + serviceFeeKobo;

  // Map payment method string to enum
  const paymentMethodEnum: PaymentMethod =
    paymentMethod === "cash" ? PaymentMethod.CASH : PaymentMethod.CARD;

  const order = await prisma.order.create({
    data: {
      trackingCode: generateTrackingCode(),
      customerId: userId,
      vendorId,
      type,
      paymentMethod: paymentMethodEnum,
      pickupAddress: vendor.address,
      pickupLat: vendor.lat,
      pickupLng: vendor.lng,
      dropoffAddress: deliveryAddress,
      dropoffLat: 0,
      dropoffLng: 0,
      subtotalKobo,
      deliveryFeeKobo,
      serviceFeeKobo,
      totalKobo,
      items: {
        create: orderItemsData,
      },
    },
    select: {
      id: true,
      status: true,
      totalKobo: true,
      trackingCode: true,
    },
  });

  notifyVendorOwnerNewOrder({
    vendorId,
    vendorName: vendor.name,
    trackingCode: order.trackingCode,
    orderId: order.id,
    orderType: type,
    totalKobo: order.totalKobo,
    paymentMethod,
    deliveryAddress,
    items: orderItemsData,
  }).catch((err) => console.error("[email] vendorNewOrder notify failed:", err));

  return order;
}

async function notifyVendorOwnerNewOrder(opts: {
  vendorId: string;
  vendorName: string;
  trackingCode: string;
  orderId: string;
  orderType: OrderType;
  totalKobo: number;
  paymentMethod: string;
  deliveryAddress: string;
  items: Array<{ name: string; quantity: number; unitPriceKobo: number; totalKobo: number }>;
}) {
  const owner = await prisma.admin.findFirst({
    where: { vendorId: opts.vendorId, role: "OWNER", isActive: true },
    select: { firstName: true, email: true },
  });
  if (!owner) return;

  const dashboardUrl = process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng";
  const orderUrl = `${dashboardUrl}/vendor/orders/${opts.orderId}`;
  const orderTypeLabel = opts.orderType.charAt(0) + opts.orderType.slice(1).toLowerCase();

  await sendEmail(
    vendorNewOrderEmail({
      ownerFirstName: owner.firstName,
      ownerEmail: owner.email,
      vendorName: opts.vendorName,
      trackingCode: opts.trackingCode,
      orderType: orderTypeLabel,
      totalKobo: opts.totalKobo,
      paymentMethod: opts.paymentMethod,
      deliveryAddress: opts.deliveryAddress,
      items: opts.items,
      dashboardOrderUrl: orderUrl,
    })
  );
}

export async function createFoodOrder(input: FoodOrderInput) {
  return createVendorOrder(input, OrderType.FOOD);
}

export async function createGroceryOrder(input: FoodOrderInput) {
  return createVendorOrder(input, OrderType.GROCERY);
}

export async function createRetailOrder(input: FoodOrderInput) {
  return createVendorOrder(input, OrderType.RETAIL);
}

export async function createPharmacyOrder(input: FoodOrderInput) {
  return createVendorOrder(input, OrderType.PHARMACY);
}
