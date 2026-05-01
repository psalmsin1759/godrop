import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/paymentService";
import { ok, fail } from "../utils/response";

export async function initializePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.initializePayment(
      req.user!.id,
      req.body.orderId,
      req.body.method
    );
    ok(res, result);
  } catch (err: any) {
    if (err.message?.includes("not found") || err.message?.includes("already paid")) {
      return fail(res, err.message, 422);
    }
    if (err.message?.includes("Insufficient")) return fail(res, err.message, 422);
    next(err);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.verifyPayment(req.body.reference);
    ok(res, result);
  } catch (err: any) {
    if (err.message?.includes("not found") || err.message?.includes("not successful")) {
      return fail(res, err.message, 422);
    }
    next(err);
  }
}
