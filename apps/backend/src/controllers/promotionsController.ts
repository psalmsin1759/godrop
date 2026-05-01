import { Request, Response, NextFunction } from "express";
import * as promotionService from "../services/promotionService";
import { ok, fail } from "../utils/response";

export async function applyPromoCode(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await promotionService.applyPromoCode(
      req.body.code,
      req.body.orderType,
      req.body.amountKobo
    );
    ok(res, result);
  } catch (err: any) {
    fail(res, err.message, 422);
  }
}

export async function listBanners(_req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await promotionService.getActiveBanners();
    ok(res, { banners });
  } catch (err) {
    next(err);
  }
}
