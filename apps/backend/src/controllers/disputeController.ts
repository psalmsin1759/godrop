import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import { paginate, buildMeta } from "../utils/pagination";
import * as disputeService from "../services/disputeService";

export async function createDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.createDispute(req.body);
    return ok(res, { data: dispute }, 201);
  } catch (err: any) {
    if (err.message === "Order not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function listDisputes(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await disputeService.listDisputes({
      status: q.status,
      category: q.category,
      raisedByType: q.raisedByType,
      search: q.search,
      page,
      limit,
    });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.getDisputeDetail(req.params.id);
    return ok(res, { data: dispute });
  } catch (err: any) {
    if (err.message === "Dispute not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function addMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await disputeService.addMessage(req.params.id, {
      senderType: "ADMIN",
      senderId: req.admin!.id,
      message: req.body.message,
      attachmentUrls: req.body.attachmentUrls,
      isInternal: req.body.isInternal,
    });
    return ok(res, { data: message }, 201);
  } catch (err: any) {
    if (err.message === "Dispute not found") return fail(res, err.message, 404);
    if (err.message.includes("already closed")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function assignDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.assignDispute(req.params.id, req.body.adminId ?? req.admin!.id);
    return ok(res, { data: dispute });
  } catch (err: any) {
    if (err.message === "Dispute not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.updateStatus(req.params.id, req.body.status);
    return ok(res, { data: dispute });
  } catch (err: any) {
    if (err.message === "Dispute not found") return fail(res, err.message, 404);
    if (err.message.includes("already closed")) return fail(res, err.message, 409);
    next(err);
  }
}

export async function resolveDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await disputeService.resolveDispute(req.params.id, {
      resolutionType: req.body.resolutionType,
      resolutionNotes: req.body.resolutionNotes,
      resolutionAmountKobo: req.body.resolutionAmountKobo,
      adminId: req.admin!.id,
    });
    return ok(res, { data: dispute });
  } catch (err: any) {
    if (err.message === "Dispute not found") return fail(res, err.message, 404);
    if (
      err.message.includes("already closed") ||
      err.message.includes("required") ||
      err.message.includes("No rider is associated")
    ) {
      return fail(res, err.message, 409);
    }
    next(err);
  }
}
