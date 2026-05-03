import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/systemAdminService";
import * as orderService from "../services/orderService";
import * as notifSvc from "../services/notificationService";
import { paginate, buildMeta } from "../utils/pagination";

// ─── Auth ─────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.loginAdmin(req.body.email, req.body.password);
    return ok(res, result);
  } catch (err: any) {
    if (err.message === "Invalid credentials") return fail(res, "Invalid email or password", 401);
    next(err);
  }
}

export async function getMe(req: Request, res: Response) {
  const { password: _pw, ...safe } = req.admin as any;
  return ok(res, { data: safe });
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.changeAdminPassword(req.admin!.id, req.body.currentPassword, req.body.newPassword);
    return ok(res, { message: "Password changed successfully" });
  } catch (err: any) {
    if (err.message === "Current password is incorrect") return fail(res, err.message, 400);
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.updateAdminProfile(req.admin!.id, req.body);
    return ok(res, { data: admin });
  } catch (err: any) {
    if (err.message === "Email is already in use") return fail(res, err.message, 409);
    next(err);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.getAdminSettings(req.admin!.id);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.updateAdminSettings(req.admin!.id, req.body);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

// ─── System Admin Management ──────────────────────────────────

export async function listAdmins(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await svc.listSystemAdmins(page, limit);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.createSystemAdmin(req.body);
    return ok(res, { data: admin }, 201);
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function updateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.updateSystemAdmin(req.params.id, req.body);
    return ok(res, { data: admin });
  } catch (err) {
    next(err);
  }
}

// ─── Vendor Management ────────────────────────────────────────

export async function listVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listVendors({
      status: req.query.status as any,
      type: req.query.type as string | undefined,
      search: req.query.search as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await svc.getVendorDetail(req.params.id);
    return ok(res, { data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function approveVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await svc.approveVendor(req.params.id);
    return ok(res, { data: vendor });
  } catch (err: any) {
    if (err.message?.includes("already approved")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function rejectVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await svc.rejectVendor(req.params.id, req.body.reason);
    return ok(res, { data: vendor });
  } catch (err: any) {
    if (err.message?.includes("already rejected")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function suspendVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await svc.suspendVendor(req.params.id, req.body.reason);
    return ok(res, { data: vendor });
  } catch (err: any) {
    if (err.message?.includes("already suspended")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function reinstateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await svc.reinstateVendor(req.params.id);
    return ok(res, { data: vendor });
  } catch (err) {
    next(err);
  }
}

// ─── Customer Management ──────────────────────────────────────

export async function listCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listCustomers({ status: q.status, search: q.search, page, limit });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await svc.getCustomerDetail(req.params.id);
    return ok(res, { data: customer });
  } catch (err: any) {
    if (err.code === "P2025") return fail(res, "Customer not found", 404);
    next(err);
  }
}

export async function getCustomerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.getCustomerOrders(req.params.id, { status: q.status, page, limit });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await svc.updateCustomerStatus(req.params.id, req.body.status);
    return ok(res, { data: customer });
  } catch (err: any) {
    if (err.code === "P2025") return fail(res, "Customer not found", 404);
    next(err);
  }
}

export async function getCustomerWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const wallet = await svc.getCustomerWallet(req.params.id);
    if (!wallet) return ok(res, { data: null });
    return ok(res, { data: wallet });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerWalletTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.getCustomerWalletTransactions(req.params.id, { type: q.type, page, limit });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

// ─── Audit Logs ───────────────────────────────────────────────

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listAuditLogs({
      vendorId: req.query.vendorId as string | undefined,
      adminId: req.query.adminId as string | undefined,
      action: req.query.action as string | undefined,
      entity: req.query.entity as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── Orders ───────────────────────────────────────────────────

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await orderService.listAllOrders({
      status: q.status,
      type: q.type,
      customerId: q.customerId,
      vendorId: q.vendorId,
      page,
      limit,
    });
    ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getAnyOrder(req.params.id);
    if (!order) return fail(res, "Order not found", 404);
    ok(res, { data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.adminUpdateOrderStatus(req.params.id, req.body.status, req.body.note);
    if (!order) return fail(res, "Order not found", 404);
    ok(res, { data: order });
  } catch (err: any) {
    if (err.message?.includes("terminal")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.adminCancelOrder(req.params.id, req.body.reason);
    if (!order) return fail(res, "Order not found", 404);
    ok(res, { data: order });
  } catch (err: any) {
    if (err.message?.includes("terminal")) return fail(res, err.message, 409);
    next(err);
  }
}

// ─── Notifications ────────────────────────────────────────────

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await notifSvc.listAdminNotifications(req.admin!.id, {
      unreadOnly: q.unreadOnly === "true",
      page,
      limit,
    });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total), unreadCount: result.unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function getNotificationsUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notifSvc.getUnreadCount(req.admin!.id);
    return ok(res, { data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notif = await notifSvc.markNotificationRead(req.params.id, req.admin!.id);
    return ok(res, { data: notif });
  } catch (err: any) {
    if (err.message === "Notification not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notifSvc.markAllNotificationsRead(req.admin!.id);
    return ok(res, { message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}
