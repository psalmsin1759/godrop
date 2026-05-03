import { z } from "zod";
import { AdminRole, OrderStatus, UserStatus } from "@prisma/client";

export const graphQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD").optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD").optional(),
  granularity: z.enum(["day", "week", "month"]).optional().default("day"),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createSystemAdminSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8),
  role: z.enum([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]).optional().default(AdminRole.ADMIN),
});

export const updateSystemAdminSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  role: z.enum([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]).optional(),
});

export const approveVendorSchema = z.object({});

export const rejectVendorSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export const suspendVendorSchema = z.object({
  reason: z.string().optional(),
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

export const adminCancelOrderSchema = z.object({
  reason: z.string().optional(),
});

export const customerQuerySchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const customerOrderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const updateCustomerStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const walletTxQuerySchema = z.object({
  type: z.enum(["TOPUP", "PAYMENT", "REFUND"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const updateAdminProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
});

export const updateAdminSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export const auditLogQuerySchema = z.object({
  vendorId: z.string().cuid().optional(),
  adminId: z.string().cuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
