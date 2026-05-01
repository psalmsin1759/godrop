import { Request, Response, NextFunction } from 'express';
import { ok } from '../utils/response';
import * as svc from '../services/analyticsService';

function parseDateRange(req: Request) {
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  const from = req.query.from
    ? new Date(req.query.from as string)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export async function vendorAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = parseDateRange(req);
    const data = await svc.getVendorAnalytics(req.admin!.vendorId!, { from, to });
    return ok(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function systemAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = parseDateRange(req);
    const data = await svc.getSystemAnalytics({ from, to });
    return ok(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function vendorGraphData(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = parseDateRange(req);
    const granularity = (req.query.granularity as svc.Granularity) || 'day';
    const data = await svc.getVendorGraphData(req.admin!.vendorId!, { from, to }, granularity);
    return ok(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function systemGraphData(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = parseDateRange(req);
    const granularity = (req.query.granularity as svc.Granularity) || 'day';
    const data = await svc.getSystemGraphData({ from, to }, granularity);
    return ok(res, { data });
  } catch (err) {
    next(err);
  }
}
