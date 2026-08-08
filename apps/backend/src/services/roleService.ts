import { prisma } from "../lib/prisma";
import { AdminType } from "@prisma/client";
import { isValidPermissionKey, PERMISSIONS_BY_TYPE } from "../lib/permissions";

// Fetches a global, seeded default role (e.g. VENDOR "Owner") — used when
// creating the first admin for a new vendor/business, or a SYSTEM admin
// without an explicit roleId.
export async function getDefaultRole(type: AdminType, name: string) {
  return prisma.role.findFirstOrThrow({
    where: { type, name, isDefault: true, vendorId: null, businessId: null },
  });
}

export function assertValidPermissions(type: AdminType, permissions: string[]) {
  const invalid = permissions.filter((p) => !isValidPermissionKey(type, p));
  if (invalid.length > 0) {
    throw new Error(`Unknown permission key(s) for ${type}: ${invalid.join(", ")}`);
  }
}

export async function listRoles(type: AdminType, scope: { vendorId?: string; businessId?: string }) {
  return prisma.role.findMany({
    where: {
      type,
      OR: [
        { isDefault: true, vendorId: null, businessId: null },
        scope.vendorId ? { vendorId: scope.vendorId } : { id: "__never__" },
        scope.businessId ? { businessId: scope.businessId } : { id: "__never__" },
      ],
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export async function createRole(
  type: AdminType,
  scope: { vendorId?: string; businessId?: string },
  data: { name: string; description?: string; permissions: string[] }
) {
  assertValidPermissions(type, data.permissions);
  return prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      type,
      vendorId: scope.vendorId,
      businessId: scope.businessId,
      isDefault: false,
    },
  });
}

async function findScopedRole(id: string, type: AdminType, scope: { vendorId?: string; businessId?: string }) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.type !== type) throw new Error("Role not found");
  const isSystemScope = !scope.vendorId && !scope.businessId;
  if (isSystemScope) {
    if (role.vendorId || role.businessId) throw new Error("Role not found");
  } else if (role.vendorId !== (scope.vendorId ?? null) || role.businessId !== (scope.businessId ?? null)) {
    throw new Error("Role not found");
  }
  return role;
}

export async function updateRole(
  id: string,
  type: AdminType,
  scope: { vendorId?: string; businessId?: string },
  data: { name?: string; description?: string; permissions?: string[] }
) {
  const role = await findScopedRole(id, type, scope);
  if (role.isDefault) throw new Error("Cannot edit a default role");
  if (data.permissions) assertValidPermissions(type, data.permissions);
  return prisma.role.update({ where: { id }, data });
}

export async function deleteRole(id: string, type: AdminType, scope: { vendorId?: string; businessId?: string }) {
  const role = await findScopedRole(id, type, scope);
  if (role.isDefault) throw new Error("Cannot delete a default role");
  const inUse = await prisma.admin.count({ where: { roleId: id } });
  if (inUse > 0) throw new Error("Cannot delete a role that is assigned to an admin");
  await prisma.role.delete({ where: { id } });
}

export function permissionCatalog(type: AdminType) {
  return PERMISSIONS_BY_TYPE[type];
}
