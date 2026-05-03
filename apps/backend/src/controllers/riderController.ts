import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/riderService";
import { paginate, buildMeta } from "../utils/pagination";
import { RiderKycStatus } from "@prisma/client";

export async function listRiders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listRiders({
      search: q.search,
      kycStatus: q.kycStatus as RiderKycStatus | undefined,
      isActive: q.isActive === "true" ? true : q.isActive === "false" ? false : undefined,
      page,
      limit,
    });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getRider(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.getRiderDetail(req.params.id);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createRider(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.createRider(req.body);
    return ok(res, { data: rider }, 201);
  } catch (err: any) {
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function updateRider(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.updateRider(req.params.id, req.body);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    if (err.message?.includes("already exists")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function updateRiderKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.updateRiderKyc(req.params.id, req.body.status, req.body.notes);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function toggleRiderActive(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.toggleRiderActive(req.params.id, req.body.isActive);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function getRiderStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await svc.getRiderStats();
    return ok(res, { data: stats });
  } catch (err) {
    next(err);
  }
}

export async function getRiderOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.getRiderOrders(req.params.id, { page, limit, status: q.status });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function getRiderEarnings(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.getRiderEarnings(req.params.id, { page, limit });
    return ok(res, {
      data: result.data,
      meta: buildMeta(result.page, result.limit, result.total),
      totalEarnedKobo: result.totalEarnedKobo,
    });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function assignOrderToRider(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await svc.assignOrderToRider(req.body.orderId, req.params.id);
    return ok(res, { data: order });
  } catch (err: any) {
    if (err.message === "Order not found" || err.message === "Rider not found") {
      return fail(res, err.message, 404);
    }
    if (err.message?.includes("cannot be assigned") || err.message?.includes("not active")) {
      return fail(res, err.message, 400);
    }
    next(err);
  }
}

export async function listAvailableRiders(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lng } = req.query as any;
    const riders = await svc.listAvailableRiders(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined
    );
    return ok(res, { data: riders });
  } catch (err) {
    next(err);
  }
}

export async function processWithdrawal(req: Request, res: Response, next: NextFunction) {
  try {
    const withdrawal = await svc.processWithdrawal(req.params.withdrawalId, req.body.action, req.body.notes);
    return ok(res, { data: withdrawal });
  } catch (err: any) {
    if (err.message === "Withdrawal not found") return fail(res, err.message, 404);
    if (err.message === "Withdrawal is not pending") return fail(res, err.message, 400);
    next(err);
  }
}
