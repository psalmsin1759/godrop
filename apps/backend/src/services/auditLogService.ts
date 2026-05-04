import { prisma } from "../lib/prisma";

export interface LogActionParams {
  adminId?: string;
  vendorId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (err) {
    // Never let audit logging crash the main request
    console.error("[audit] Failed to write log:", err);
  }
}
