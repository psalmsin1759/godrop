import { Request, Response, NextFunction } from "express";
import { requireAdminAuth, requireVendorAdmin, requireVendorRole } from "./adminAuth";

export { requireVendorRole };

export function requireVendorAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    requireVendorAdmin(req, res, next);
  });
}
