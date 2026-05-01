import { Request, Response, NextFunction } from "express";
import * as vendorService from "../services/vendorService";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";

export async function listPharmacies(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await vendorService.listPharmacies({
      lat: q.lat ? Number(q.lat) : undefined,
      lng: q.lng ? Number(q.lng) : undefined,
      page,
      limit,
      search: q.search,
      isOpen: q.isOpen !== undefined ? q.isOpen === "true" : undefined,
    });
    ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getPharmacy(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await vendorService.getVendorWithCategories(req.params.id);
    if (!vendor) return fail(res, "Pharmacy not found", 404);
    ok(res, { pharmacy: vendor, categories: vendor.categories });
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const items = await vendorService.getMenuItems(id, q.categoryId);
    ok(res, { data: items, meta: buildMeta(page, limit, items.length) });
  } catch (err) {
    next(err);
  }
}

export async function searchPharmacy(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, lat, lng } = req.query as any;
    const { vendors: pharmacies, products } = await vendorService.searchVendors(
      "PHARMACY" as any,
      q,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined
    );
    ok(res, { pharmacies, products });
  } catch (err) {
    next(err);
  }
}
