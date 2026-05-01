import { Request, Response, NextFunction } from "express";
import * as pricingService from "../services/pricingService";
import * as orderService from "../services/orderService";
import { ok, created } from "../utils/response";

export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { pickup, dropoff } = req.body;
    const result = pricingService.parcelQuote(pickup, dropoff);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.placeParcelOrder(req.user!.id, req.body);
    created(res, { order });
  } catch (err) {
    next(err);
  }
}
