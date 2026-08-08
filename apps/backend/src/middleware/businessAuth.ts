import { Request, Response, NextFunction } from "express";
import { requireAdminAuth, requireBusinessAdmin, requirePermission, requireOwner } from "./adminAuth";

export { requirePermission, requireOwner };

export function requireBusinessAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    requireBusinessAdmin(req, res, next);
  });
}
