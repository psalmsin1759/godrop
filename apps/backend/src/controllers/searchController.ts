import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ok } from "../utils/response";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = ((req.query.q as string) ?? "").trim();
    const type = (req.query.type as string) ?? "all";
    const limit = 20;

    if (!q || q.length < 2) {
      return ok(res, { vendors: [], products: [] });
    }

    const vendorTypeFilter: any = {};
    switch (type) {
      case "restaurant": vendorTypeFilter.type = "RESTAURANT"; break;
      case "grocery":    vendorTypeFilter.type = "GROCERY"; break;
      case "retail":     vendorTypeFilter.type = "RETAIL"; break;
      case "pharmacy":   vendorTypeFilter.type = "PHARMACY"; break;
    }

    const [vendors, products] = await Promise.all([
      prisma.vendor.findMany({
        where: {
          ...vendorTypeFilter,
          status: "APPROVED",
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          type: true,
          name: true,
          description: true,
          logoUrl: true,
          coverUrl: true,
          address: true,
          lat: true,
          lng: true,
          rating: true,
          ratingCount: true,
          deliveryFeeKobo: true,
          estimatedMinutes: true,
          isOpen: true,
        },
        take: limit,
      }),
      type === "all" || type === "product"
        ? prisma.product.findMany({
            where: {
              isAvailable: true,
              category: { vendor: { status: "APPROVED", isActive: true, ...vendorTypeFilter } },
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              description: true,
              priceKobo: true,
              imageUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  vendor: { select: { id: true, name: true, type: true, logoUrl: true } },
                },
              },
            },
            take: limit,
          })
        : Promise.resolve([]),
    ]);

    ok(res, { vendors, products });
  } catch (err) {
    next(err);
  }
}
