import { prisma } from "../lib/prisma";
import { VendorType, VendorStatus } from "@prisma/client";
import { haversineKm } from "../utils/distance";
import { paginate } from "../utils/pagination";

const NEARBY_RADIUS_KM = 15;

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

  // Sort by distance if coordinates provided
  if (opts.lat !== undefined && opts.lng !== undefined) {
    vendors = vendors
      .map((v) => ({ ...v, distanceKm: haversineKm(opts.lat!, opts.lng!, v.lat, v.lng) }))
      .filter((v) => v.distanceKm <= NEARBY_RADIUS_KM)
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
