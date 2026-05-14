import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/vendorAdminService";
import * as systemSvc from "../services/systemAdminService";
import { uploadBuffer } from "../services/cloudinaryService";
import * as notifSvc from "../services/notificationService";
import { paginate, buildMeta } from "../utils/pagination";

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.getProfile(req.admin!.id);
    return ok(res, { data: admin });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.changePassword(req.admin!.id, req.body.currentPassword, req.body.newPassword);
    return ok(res, { message: "Password changed successfully" });
  } catch (err: any) {
    if (err.message === "Current password is incorrect") return fail(res, err.message, 400);
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.updateProfile(req.admin!.id, req.body);
    return ok(res, { data: admin });
  } catch (err: any) {
    if (err.message === "Email is already in use") return fail(res, err.message, 409);
    next(err);
  }
}

export async function getProfileSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.getSettings(req.admin!.id);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.updateSettings(req.admin!.id, req.body);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

// ─── Categories ───────────────────────────────────────────────

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.listCategories(req.admin!.vendorId!);
    return ok(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await svc.getCategory(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: cat });
  } catch (err: any) {
    if (err.message === "Category not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await svc.createCategory(req.admin!.vendorId!, req.body);
    return ok(res, { data: cat }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await svc.updateCategory(req.params.id, req.admin!.vendorId!, req.body);
    return ok(res, { data: cat });
  } catch (err: any) {
    if (err.message === "Category not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function toggleCategoryActive(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await svc.toggleCategoryActive(req.params.id, req.admin!.vendorId!, req.body.isActive);
    return ok(res, { data: cat });
  } catch (err: any) {
    if (err.message === "Category not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteCategory(req.params.id, req.admin!.vendorId!);
    return ok(res, { message: "Category deleted" });
  } catch (err: any) {
    if (err.message === "Category not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot delete")) return fail(res, err.message, 409);
    next(err);
  }
}

// ─── Products ─────────────────────────────────────────────────

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await svc.getProduct(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: product });
  } catch (err: any) {
    if (err.message === "Product not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listProducts(req.admin!.vendorId!, {
      categoryId: req.query.categoryId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await svc.createProduct(req.admin!.vendorId!, req.body);
    return ok(res, { data: product }, 201);
  } catch (err: any) {
    if (err.message === "Category not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await svc.updateProduct(req.params.id, req.admin!.vendorId!, req.body);
    return ok(res, { data: product });
  } catch (err: any) {
    if (err.message === "Product not found") return fail(res, err.message, 404);
    if (err.message === "Category not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteProduct(req.params.id, req.admin!.vendorId!);
    return ok(res, { message: "Product deleted" });
  } catch (err: any) {
    if (err.message === "Product not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function toggleProductAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await svc.toggleProductAvailability(
      req.params.id,
      req.admin!.vendorId!,
      req.body.isAvailable
    );
    return ok(res, { data: product });
  } catch (err: any) {
    if (err.message === "Product not found") return fail(res, err.message, 404);
    next(err);
  }
}

// ─── Orders ───────────────────────────────────────────────────

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listVendorOrders(req.admin!.vendorId!, {
      status: req.query.status as any,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await svc.getVendorOrder(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function acceptOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const [order] = await svc.acceptOrder(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot transition")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function markOrderPreparing(req: Request, res: Response, next: NextFunction) {
  try {
    const [order] = await svc.markOrderPreparing(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot transition")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function markOrderReady(req: Request, res: Response, next: NextFunction) {
  try {
    const [order] = await svc.markOrderReady(req.params.id, req.admin!.vendorId!);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot transition")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function rejectOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const [order] = await svc.rejectOrder(req.params.id, req.admin!.vendorId!, req.body.reason);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot transition")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.cancelOrder(req.params.id, req.admin!.vendorId!, req.body.reason);
    return ok(res, { message: "Order cancelled and customer refunded if applicable" });
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot cancel")) return fail(res, err.message, 409);
    next(err);
  }
}

// ─── Settings ─────────────────────────────────────────────────

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.getVendorSettings(req.admin!.vendorId!);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await svc.updateVendorSettings(req.admin!.vendorId!, req.body);
    return ok(res, { data: settings });
  } catch (err) {
    next(err);
  }
}

// ─── Team ─────────────────────────────────────────────────────

export async function listTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await svc.listTeamMembers(req.admin!.vendorId!);
    return ok(res, { data: members });
  } catch (err) {
    next(err);
  }
}

export async function inviteTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await svc.inviteTeamMember(req.admin!.vendorId!, req.body);
    return ok(res, { data: member }, 201);
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function updateTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await svc.updateTeamMemberRole(
      req.params.memberId,
      req.admin!.vendorId!,
      req.body.role
    );
    return ok(res, { data: member });
  } catch (err: any) {
    if (err.message === "Team member not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot change")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function removeTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.removeTeamMember(
      req.params.memberId,
      req.admin!.vendorId!,
      req.admin!.id
    );
    return ok(res, { message: "Team member removed" });
  } catch (err: any) {
    if (err.message === "Team member not found") return fail(res, err.message, 404);
    if (err.message?.includes("Cannot remove")) return fail(res, err.message, 409);
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

export async function uploadCatalogImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, "No file uploaded", 400);
    const url = await uploadBuffer(req.file.buffer, "godrop/catalog");
    return ok(res, { data: { url } });
  } catch (err) {
    next(err);
  }
}

export async function listVendorAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await systemSvc.listAuditLogs({
      vendorId: req.admin!.vendorId!,
      action: req.query.action as string | undefined,
      entity: req.query.entity as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 15),
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}
