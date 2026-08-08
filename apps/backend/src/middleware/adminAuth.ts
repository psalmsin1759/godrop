import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AdminType } from "@prisma/client";
import { fail } from "../utils/response";
import { hasPermission, WILDCARD } from "../lib/permissions";

interface AdminJwtPayload {
  adminId: string;
  type: "admin";
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return fail(res, "Unauthorized", 401);

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminJwtPayload;
    if (payload.type !== "admin") return fail(res, "Unauthorized", 401);

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      include: { vendor: true, role: true },
    });
    if (!admin || !admin.isActive) return fail(res, "Unauthorized", 401);

    req.admin = admin;
    next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}

export function requireSystemAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.type !== AdminType.SYSTEM) {
    return fail(res, "Forbidden — system admin access required", 403);
  }
  next();
}

export function requireVendorAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.type !== AdminType.VENDOR) {
    return fail(res, "Forbidden — vendor admin access required", 403);
  }
  next();
}

export function requireBusinessAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin || req.admin.type !== AdminType.BUSINESS) {
    return fail(res, "Forbidden — business admin access required", 403);
  }
  next();
}

// Granular RBAC: gate a route on a permission key from the admin's Role
// (see lib/permissions.ts for the catalog). '*' on a role grants everything.
export function requirePermission(key: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin;
    if (!admin) return fail(res, "Unauthorized", 401);
    if (!hasPermission(admin.role?.permissions, key)) {
      return fail(res, "Forbidden — insufficient permissions", 403);
    }
    next();
  };
}

// Identity check (not a capability check) — for actions exclusive to the
// account owner (e.g. deleting the vendor/business account), independent
// of whatever permission bundle the owner's role happens to grant.
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.admin?.isOwner) {
    return fail(res, "Forbidden — owner access required", 403);
  }
  next();
}

export { WILDCARD };
