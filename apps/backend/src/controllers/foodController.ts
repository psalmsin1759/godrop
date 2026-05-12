import { Request, Response, NextFunction } from "express";
import * as vendorService from "../services/vendorService";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";

export async function listRestaurants(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await vendorService.listRestaurants({
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

export async function getRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await vendorService.getVendorWithCategories(req.params.id);
    if (!vendor) return fail(res, "Restaurant not found", 404);
    ok(res, { restaurant: vendor, categories: vendor.categories });
  } catch (err) {
    next(err);
  }
}

export async function getMenuItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { categoryId } = req.query as any;
    const items = await vendorService.getMenuItems(id, categoryId);
    ok(res, { items });
  } catch (err) {
    next(err);
  }
}

export async function searchFood(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, lat, lng } = req.query as any;
    const { vendors: restaurants, products: items } = await vendorService.searchVendors(
      "RESTAURANT" as any,
      q,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined
    );
    ok(res, { restaurants, items });
  } catch (err) {
    next(err);
  }
}

export async function getRestaurantReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { page, limit } = paginate(req.query.page, req.query.limit);
    const result = await vendorService.getVendorReviews(id, page, limit);
    ok(res, {
      data: result.data,
      meta: buildMeta(result.page, result.limit, result.total),
      averageRating: result.averageRating,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId, items, deliveryAddress, paymentMethod } = req.body;
    const userId = req.user!.id;
    const order = await vendorService.createFoodOrder({
      userId,
      vendorId,
      items,
      deliveryAddress,
      paymentMethod,
    });
    ok(res, { success: true, order });
  } catch (err) {
    next(err);
  }
}
