import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/vendorAdminService";

export async function onboard(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const businessReg = files?.businessRegistration?.[0];
    const govId = files?.governmentId?.[0];
    const utilityBill = files?.utilityBill?.[0];

    if (!businessReg || !govId || !utilityBill) {
      return fail(
        res,
        "All three documents are required: businessRegistration, governmentId, utilityBill",
        400
      );
    }

    const result = await svc.onboardVendor({
      ...req.body,
      documentBuffers: {
        businessRegistration: businessReg.buffer,
        governmentId: govId.buffer,
        utilityBill: utilityBill.buffer,
      },
    });

    return ok(res, result, 201);
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}
