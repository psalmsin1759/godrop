import { z } from "zod";
import { DisputeCategory, DisputeRaisedByType, DisputeResolutionType, DisputeStatus } from "@prisma/client";

export const createDisputeSchema = z
  .object({
    orderId: z.string().min(1),
    raisedByType: z.nativeEnum(DisputeRaisedByType),
    raisedByCustomerId: z.string().optional(),
    raisedByVendorId: z.string().optional(),
    raisedByRiderId: z.string().optional(),
    category: z.nativeEnum(DisputeCategory),
    description: z.string().min(5).max(2000),
    evidenceUrls: z.array(z.string().url()).max(10).nullable().optional(),
  })
  .refine(
    (d) =>
      (d.raisedByType === "CUSTOMER" && !!d.raisedByCustomerId) ||
      (d.raisedByType === "VENDOR" && !!d.raisedByVendorId) ||
      (d.raisedByType === "RIDER" && !!d.raisedByRiderId),
    { message: "The id matching raisedByType is required" }
  );

export const disputeQuerySchema = z.object({
  status: z.nativeEnum(DisputeStatus).optional(),
  category: z.nativeEnum(DisputeCategory).optional(),
  raisedByType: z.nativeEnum(DisputeRaisedByType).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const addDisputeMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  attachmentUrls: z.array(z.string().url()).max(10).nullable().optional(),
  isInternal: z.boolean().optional(),
});

export const assignDisputeSchema = z.object({
  adminId: z.string().optional(),
});

export const updateDisputeStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "AWAITING_RESPONSE", "ESCALATED"]),
});

// ─── Self-service (customer/vendor/rider app) ───────────────────

export const createMyDisputeSchema = z.object({
  orderId: z.string().min(1),
  category: z.nativeEnum(DisputeCategory),
  description: z.string().min(5).max(2000),
  evidenceUrls: z.array(z.string().url()).max(10).nullable().optional(),
});

export const myDisputeQuerySchema = z.object({
  status: z.nativeEnum(DisputeStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const addMyMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  attachmentUrls: z.array(z.string().url()).max(10).nullable().optional(),
});

export const resolveDisputeSchema = z
  .object({
    resolutionType: z.nativeEnum(DisputeResolutionType),
    resolutionNotes: z.string().max(2000).optional(),
    resolutionAmountKobo: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (d) =>
      (d.resolutionType !== "REFUND_CUSTOMER" && d.resolutionType !== "COMPENSATE_RIDER") ||
      !!d.resolutionAmountKobo,
    { message: "resolutionAmountKobo is required for a refund or compensation" }
  );
