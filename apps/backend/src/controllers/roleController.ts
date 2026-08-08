import { Request, Response, NextFunction } from "express";
import { AdminType } from "@prisma/client";
import { ok, fail } from "../utils/response";
import * as roleSvc from "../services/roleService";
import { SYSTEM_PERMISSIONS, VENDOR_PERMISSIONS, BUSINESS_PERMISSIONS } from "../lib/permissions";

function scopeFor(req: Request): { type: AdminType; vendorId?: string; businessId?: string } {
  const admin = req.admin!;
  if (admin.type === AdminType.VENDOR) return { type: AdminType.VENDOR, vendorId: admin.vendorId! };
  if (admin.type === AdminType.BUSINESS) return { type: AdminType.BUSINESS, businessId: admin.businessId! };
  return { type: AdminType.SYSTEM };
}

export async function listSystemPermissions(_req: Request, res: Response) {
  return ok(res, { data: SYSTEM_PERMISSIONS });
}

export async function listVendorPermissions(_req: Request, res: Response) {
  return ok(res, { data: VENDOR_PERMISSIONS });
}

export async function listBusinessPermissions(_req: Request, res: Response) {
  return ok(res, { data: BUSINESS_PERMISSIONS });
}

export async function listRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, ...scope } = scopeFor(req);
    const roles = await roleSvc.listRoles(type, scope);
    return ok(res, { data: roles });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, ...scope } = scopeFor(req);
    const role = await roleSvc.createRole(type, scope, req.body);
    return ok(res, { data: role }, 201);
  } catch (err: any) {
    if (err.message?.startsWith("Unknown permission")) return fail(res, err.message, 400);
    if (err.code === "P2002") return fail(res, "A role with this name already exists", 409);
    next(err);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, ...scope } = scopeFor(req);
    const role = await roleSvc.updateRole(req.params.id, type, scope, req.body);
    return ok(res, { data: role });
  } catch (err: any) {
    if (err.message === "Role not found") return fail(res, err.message, 404);
    if (err.message === "Cannot edit a default role") return fail(res, err.message, 403);
    if (err.message?.startsWith("Unknown permission")) return fail(res, err.message, 400);
    next(err);
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, ...scope } = scopeFor(req);
    await roleSvc.deleteRole(req.params.id, type, scope);
    return ok(res, { message: "Role deleted" });
  } catch (err: any) {
    if (err.message === "Role not found") return fail(res, err.message, 404);
    if (err.message === "Cannot delete a default role") return fail(res, err.message, 403);
    if (err.message?.includes("assigned to an admin")) return fail(res, err.message, 409);
    next(err);
  }
}
