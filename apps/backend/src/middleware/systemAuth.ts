import { Request, Response, NextFunction } from "express";
import { requireAdminAuth, requireSystemAdmin, requirePermission, requireOwner } from "./adminAuth";

export { requirePermission, requireOwner };

export function requireSystemAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    requireSystemAdmin(req, res, next);
  });
}
