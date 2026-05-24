import { Request, Response, NextFunction } from "express";
import { AdminType } from "@prisma/client";
import { requireAdminAuth } from "./adminAuth";
import { fail } from "../utils/response";

export function requireBusinessAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    if (!req.admin || req.admin.type !== AdminType.BUSINESS) {
      return fail(res, "Forbidden — business admin access required", 403);
    }
    next();
  });
}

export function requireBusinessOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.role !== "OWNER") {
    return fail(res, "Forbidden — business owner access required", 403);
  }
  next();
}
