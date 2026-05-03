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
