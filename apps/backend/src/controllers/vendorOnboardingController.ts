import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/vendorAdminService";

export async function onboard(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.onboardVendor(req.body);
    return ok(res, result, 201);
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}
