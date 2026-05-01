import { Request, Response, NextFunction } from "express";
import { logAction } from "../services/auditLogService";

interface AuditConfig {
  action: string;
  entity: string;
  getEntityId?: (req: Request) => string | undefined;
  getNewValues?: (req: Request) => object | undefined;
}

function auditAdminAction(config: AuditConfig) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: any) {
      if (_res.statusCode < 400 && req.admin) {
        const entityId = config.getEntityId?.(req) ?? body?.data?.id ?? undefined;
        const newValues = config.getNewValues?.(req) ?? req.body;
        logAction({
          adminId: req.admin.id,
          vendorId: req.admin.vendorId ?? undefined,
          action: config.action,
          entity: config.entity,
          entityId,
          newValues,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });
      }
      return originalJson(body);
    };
    next();
  };
}

export const auditVendorAction = auditAdminAction;
export const auditSystemAction = auditAdminAction;
