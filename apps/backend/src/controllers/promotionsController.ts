import { Request, Response, NextFunction } from "express";
import * as promotionService from "../services/promotionService";
import { ok, fail } from "../utils/response";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "../validators/promotionAdminValidators";

// ─── Public / customer-facing ──────────────────────────────────

export async function applyPromoCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, orderType, deliveryFeeKobo, orderValueKobo } = req.body;
    const result = await promotionService.applyPromoCode({
      code,
      orderType,
      deliveryFeeKobo,
      orderValueKobo,
    });
    ok(res, { discountKobo: result.discountKobo, description: result.description, validUntil: result.validUntil });
  } catch (err: any) {
    fail(res, err.message, 422);
  }
}

// ─── Admin (coupon management) ─────────────────────────────────

export async function listPromotions(req: Request, res: Response, next: NextFunction) {
  try {
    const promotions = await promotionService.listPromotions();
    return ok(res, { data: promotions });
  } catch (err) {
    next(err);
  }
}

export async function getPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const promotion = await promotionService.getPromotion(req.params.id);
    return ok(res, { data: promotion });
  } catch (err: any) {
    if (err.message === "Promotion not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createPromotionSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const promotion = await promotionService.createPromotion(parsed.data);
    return ok(res, { data: promotion }, 201);
  } catch (err: any) {
    if (err.message === "A coupon with this code already exists") {
      return fail(res, err.message, 409);
    }
    next(err);
  }
}

export async function updatePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updatePromotionSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const promotion = await promotionService.updatePromotion(req.params.id, parsed.data);
    return ok(res, { data: promotion });
  } catch (err: any) {
    if (err.message === "Promotion not found") return fail(res, err.message, 404);
    if (err.message === "A coupon with this code already exists") {
      return fail(res, err.message, 409);
    }
    next(err);
  }
}

export async function deletePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    await promotionService.deletePromotion(req.params.id);
    return ok(res, { message: "Coupon deleted" });
  } catch (err: any) {
    if (err.message === "Promotion not found") return fail(res, err.message, 404);
    next(err);
  }
}
