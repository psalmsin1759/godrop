import { AdminType } from "@prisma/client";

// Granular RBAC permission catalog. These keys are code-defined (tied to
// real routes/UI) — what makes a *role* is the data-driven bundle of keys
// stored on Role.permissions, editable from the dashboard.
export const WILDCARD = "*";

export interface PermissionDef {
  key: string;
  module: string;
  label: string;
}

export const SYSTEM_PERMISSIONS: PermissionDef[] = [
  { key: "orders:read", module: "Orders", label: "View orders" },
  { key: "orders:write", module: "Orders", label: "Manage orders (status, cancel, assign)" },
  { key: "vendors:read", module: "Vendors", label: "View vendors" },
  { key: "vendors:write", module: "Vendors", label: "Approve/reject/suspend vendors" },
  { key: "riders:read", module: "Riders", label: "View riders" },
  { key: "riders:write", module: "Riders", label: "Create/edit riders, KYC, assign orders" },
  { key: "riders:payouts", module: "Riders", label: "Process rider withdrawals" },
  { key: "customers:read", module: "Customers", label: "View customers" },
  { key: "customers:write", module: "Customers", label: "Update customer status" },
  { key: "trucks:read", module: "Trucks", label: "View truck config" },
  { key: "trucks:write", module: "Trucks", label: "Manage truck types/pricing" },
  { key: "parcels:read", module: "Parcels", label: "View parcel config" },
  { key: "parcels:write", module: "Parcels", label: "Manage parcel vehicle types" },
  { key: "businesses:read", module: "Businesses", label: "View businesses" },
  { key: "businesses:write", module: "Businesses", label: "Manage businesses" },
  { key: "disputes:read", module: "Disputes", label: "View disputes" },
  { key: "disputes:write", module: "Disputes", label: "Assign/resolve disputes" },
  { key: "analytics:read", module: "Analytics", label: "View analytics" },
  { key: "audit_logs:read", module: "Audit Logs", label: "View audit logs" },
  { key: "heroes:write", module: "Growth", label: "Manage hero slides" },
  { key: "banners:write", module: "Growth", label: "Manage promo banners" },
  { key: "coupons:write", module: "Growth", label: "Manage coupons" },
  { key: "messaging:send", module: "Messaging", label: "Send email/SMS" },
  { key: "push:send", module: "Messaging", label: "Send push notifications" },
  { key: "admins:read", module: "Administration", label: "View admins" },
  { key: "admins:write", module: "Administration", label: "Create/edit admins" },
  { key: "roles:read", module: "Administration", label: "View roles" },
  { key: "roles:write", module: "Administration", label: "Create/edit roles & permissions" },
  { key: "settings:read", module: "Administration", label: "View platform settings" },
  { key: "settings:write", module: "Administration", label: "Update platform settings" },
  { key: "otp:issue", module: "Administration", label: "Issue manual OTP (sensitive)" },
];

export const VENDOR_PERMISSIONS: PermissionDef[] = [
  { key: "orders:read", module: "Orders", label: "View orders" },
  { key: "orders:write", module: "Orders", label: "Accept/reject/prepare/cancel orders" },
  { key: "catalog:read", module: "Catalogue", label: "View categories/products" },
  { key: "catalog:write", module: "Catalogue", label: "Manage categories/products" },
  { key: "wallet:read", module: "Wallet", label: "View wallet balance & transactions" },
  { key: "wallet:write", module: "Wallet", label: "Request/process withdrawals" },
  { key: "disputes:read", module: "Disputes", label: "View disputes" },
  { key: "disputes:write", module: "Disputes", label: "Raise/respond to disputes" },
  { key: "analytics:read", module: "Analytics", label: "View analytics" },
  { key: "audit_logs:read", module: "Audit Logs", label: "View audit logs" },
  { key: "team:read", module: "Team", label: "View team members" },
  { key: "team:write", module: "Team", label: "Invite/edit/remove team members, manage roles" },
  { key: "settings:read", module: "Settings", label: "View vendor settings" },
  { key: "settings:write", module: "Settings", label: "Update vendor settings" },
];

export const BUSINESS_PERMISSIONS: PermissionDef[] = [
  { key: "riders:read", module: "Riders", label: "View riders" },
  { key: "riders:write", module: "Riders", label: "Assign/remove riders" },
  { key: "wallet:read", module: "Wallet", label: "View wallet balance & transactions" },
  { key: "team:read", module: "Team", label: "View team members" },
  { key: "team:write", module: "Team", label: "Invite/edit/remove team members, manage roles" },
  { key: "business:write", module: "Business", label: "Update business profile & documents" },
  { key: "settings:read", module: "Settings", label: "View settings" },
];

export const PERMISSIONS_BY_TYPE: Record<AdminType, PermissionDef[]> = {
  SYSTEM: SYSTEM_PERMISSIONS,
  VENDOR: VENDOR_PERMISSIONS,
  BUSINESS: BUSINESS_PERMISSIONS,
};

export function isValidPermissionKey(type: AdminType, key: string): boolean {
  if (key === WILDCARD) return true;
  return PERMISSIONS_BY_TYPE[type].some((p) => p.key === key);
}

export function hasPermission(permissions: string[] | undefined, key: string): boolean {
  if (!permissions) return false;
  return permissions.includes(WILDCARD) || permissions.includes(key);
}
