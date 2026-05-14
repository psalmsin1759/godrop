import { z } from "zod";
import { AdminRole } from "@prisma/client";

export const graphQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD").optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD").optional(),
  granularity: z.enum(["day", "week", "month"]).optional().default("day"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const toggleCategoryActiveSchema = z.object({
  isActive: z.boolean(),
});

export const createProductSchema = z.object({
  categoryId: z.string().cuid("Invalid category ID"),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priceKobo: z.number().int().positive("Price must be positive"),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
  stock: z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  categoryId: z.string().cuid().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  priceKobo: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().optional(),
  stock: z.number().int().min(0).optional().nullable(),
});

export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const updateVendorSettingsSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  phone: z.string().regex(/^\+234\d{10}$/).optional(),
  email: z.string().email().optional(),
  deliveryFeeKobo: z.number().int().min(0).optional(),
  estimatedMinutes: z.number().int().min(1).max(300).optional(),
  isOpen: z.boolean().optional(),
  openingHours: z.record(z.any()).optional(),
  cashOnDeliveryEnabled: z.boolean().optional(),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum([AdminRole.MANAGER, AdminRole.STAFF]),
});

export const updateTeamMemberSchema = z.object({
  role: z.enum([AdminRole.MANAGER, AdminRole.STAFF]),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const rejectOrderSchema = z.object({
  reason: z.string().min(1).optional(),
});

export const updateVendorAdminProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
});

export const updateVendorAdminSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  orderAlerts: z.boolean().optional(),
});
