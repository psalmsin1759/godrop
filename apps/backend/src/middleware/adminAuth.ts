import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AdminRole, AdminType } from "@prisma/client";
import { fail } from "../utils/response";

type SystemRole = Extract<AdminRole, "SUPER_ADMIN" | "ADMIN">;
type VendorRole = Extract<AdminRole, "OWNER" | "MANAGER" | "STAFF">;

const SYSTEM_ROLE_WEIGHT: Record<SystemRole, number> = {
  SUPER_ADMIN: 2,
  ADMIN: 1,
};

const VENDOR_ROLE_WEIGHT: Record<VendorRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  STAFF: 1,
};

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
      include: { vendor: true },
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

export function requireSystemRole(minRole: SystemRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin;
    if (!admin) return fail(res, "Unauthorized", 401);
    if (admin.type !== AdminType.SYSTEM) return fail(res, "Forbidden", 403);
    const weight = SYSTEM_ROLE_WEIGHT[admin.role as SystemRole];
    if (!weight || weight < SYSTEM_ROLE_WEIGHT[minRole]) {
      return fail(res, "Forbidden — insufficient permissions", 403);
    }
    next();
  };
}

export function requireVendorRole(minRole: VendorRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin;
    if (!admin) return fail(res, "Unauthorized", 401);
    if (admin.type !== AdminType.VENDOR) return fail(res, "Forbidden", 403);
    const weight = VENDOR_ROLE_WEIGHT[admin.role as VendorRole];
    if (!weight || weight < VENDOR_ROLE_WEIGHT[minRole]) {
      return fail(res, "Forbidden — insufficient permissions", 403);
    }
    next();
  };
}
