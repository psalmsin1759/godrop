import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/orderService";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await orderService.listOrders(req.user!.id, {
      status: q.status,
      type: q.type,
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
    const order = await orderService.getOrder(req.params.id, req.user!.id);
    if (!order) return fail(res, "Order not found", 404);
    ok(res, { order, items: order.items, timeline: order.events, rider: order.rider });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user!.id, req.body.reason);
    if (!order) return fail(res, "Order not found", 404);
    ok(res, { order });
  } catch (err: any) {
    if (err.message?.includes("cannot be cancelled")) return fail(res, err.message, 422);
    next(err);
  }
}

export async function rateOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await orderService.rateOrder(
      req.params.id,
      req.user!.id,
      req.body.rating,
      req.body.comment
    );
    ok(res, { review });
  } catch (err: any) {
    if (err.message?.includes("not found")) return fail(res, err.message, 404);
    next(err);
  }
}

export async function reorder(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await orderService.reorder(req.params.id, req.user!.id);
    if (!cart) return fail(res, "Order not found", 404);
    ok(res, { cart });
  } catch (err) {
    next(err);
  }
}

export async function getTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await orderService.getTracking(req.params.id, req.user!.id);
    if (!data) return fail(res, "Order not found", 404);
    ok(res, data);
  } catch (err) {
    next(err);
  }
}
