import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import * as fcmService from "../services/fcmService";
import { ok, fail } from "../utils/response";

// ─── Customer push ─────────────────────────────────────────────

export async function notifyCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, body, data } = req.body;

    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) return fail(res, "Customer not found", 404);

    const result = await fcmService.sendToCustomers([id], { title, body }, data);
    ok(res, { message: "Notification sent", ...result });
  } catch (err) {
    next(err);
  }
}

export async function notifyCustomerBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { customerIds, title, body, data } = req.body;
    const result = await fcmService.sendToCustomers(customerIds, { title, body }, data);
    ok(res, { message: "Notifications sent", ...result });
  } catch (err) {
    next(err);
  }
}

export async function broadcastToCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, body, data } = req.body;
    const result = await fcmService.sendToAllCustomers({ title, body }, data);
    ok(res, { message: "Broadcast sent to all customers", ...result });
  } catch (err) {
    next(err);
  }
}

// ─── Rider push ────────────────────────────────────────────────

export async function notifyRider(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, body, data } = req.body;

    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) return fail(res, "Rider not found", 404);

    const result = await fcmService.sendToRiders([id], { title, body }, data);
    ok(res, { message: "Notification sent", ...result });
  } catch (err) {
    next(err);
  }
}

export async function notifyRiderBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { riderIds, title, body, data } = req.body;
    const result = await fcmService.sendToRiders(riderIds, { title, body }, data);
    ok(res, { message: "Notifications sent", ...result });
  } catch (err) {
    next(err);
  }
}

export async function broadcastToRiders(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, body, data } = req.body;
    const result = await fcmService.sendToAllRiders({ title, body }, data);
    ok(res, { message: "Broadcast sent to all riders", ...result });
  } catch (err) {
    next(err);
  }
}
