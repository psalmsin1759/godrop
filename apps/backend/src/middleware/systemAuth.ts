import { Request, Response, NextFunction } from "express";
import { requireAdminAuth, requireSystemAdmin, requireSystemRole } from "./adminAuth";

export { requireSystemRole };

export function requireSystemAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res, (err?: any) => {
    if (err) return next(err);
    requireSystemAdmin(req, res, next);
  });
}
