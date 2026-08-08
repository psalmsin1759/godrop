import { Request, Response, NextFunction } from "express";
import { requireAdminAuth, requireVendorAdmin, requirePermission, requireOwner } from "./adminAuth";

export { requirePermission, requireOwner };

export function requireVendorAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    requireVendorAdmin(req, res, next);
  });
}
