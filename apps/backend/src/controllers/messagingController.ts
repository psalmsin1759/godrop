import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail, adminBroadcastEmail } from "../services/emailService";
import { getTermiiSenderIds, requestTermiiSenderId } from "../services/sms";
import { ok, fail } from "../utils/response";

function smtpError(err: any): string | null {
  if (err?.responseCode || err?.code === "EAUTH" || err?.code === "ECONNREFUSED" || err?.code === "ETIMEDOUT") {
    return err.message ?? "SMTP connection failed";
  }
  return null;
}

export async function sendEmailSingle(req: Request, res: Response, next: NextFunction) {
  try {
    const { to, subject, html, text } = req.body;
    await sendEmail(adminBroadcastEmail({ to, subject, bodyHtml: html, bodyText: text }));
    ok(res, { message: `Email sent to ${to}` });
  } catch (err: any) {
    const msg = smtpError(err);
    if (msg) return fail(res, `Email delivery failed: ${msg}`, 502);
    next(err);
  }
}

export async function sendEmailBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { emails, subject, html, text } = req.body;

    const results = await Promise.allSettled(
      emails.map((to: string) => sendEmail(adminBroadcastEmail({ to, subject, bodyHtml: html, bodyText: text })))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (sent === 0 && failed > 0) {
      const firstErr = (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason;
      const msg = smtpError(firstErr) ?? "All recipients failed";
      return fail(res, `Email delivery failed: ${msg}`, 502);
    }

    ok(res, { message: "Batch email complete", sent, failed, total: emails.length });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailAllCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, html, text } = req.body;

    const customers = await prisma.user.findMany({
      where: { email: { not: null }, status: "ACTIVE" },
      select: { email: true },
    });

    const emails = customers.map((c) => c.email!).filter(Boolean);

    if (emails.length === 0) {
      return ok(res, { message: "No active customers with email addresses found", sent: 0, failed: 0, total: 0 });
    }

    const results = await Promise.allSettled(
      emails.map((to) => sendEmail(adminBroadcastEmail({ to, subject, bodyHtml: html, bodyText: text })))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (sent === 0 && failed > 0) {
      const firstErr = (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason;
      const msg = smtpError(firstErr) ?? "All recipients failed";
      return fail(res, `Email delivery failed: ${msg}`, 502);
    }

    ok(res, { message: "Broadcast email complete", sent, failed, total: emails.length });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailAllVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, html, text } = req.body;

    const owners = await prisma.admin.findMany({
      where: { type: "VENDOR", role: "OWNER", isActive: true, vendor: { isActive: true } },
      select: { email: true },
    });

    const emails = [...new Set(owners.map((o) => o.email).filter(Boolean))];

    if (emails.length === 0) {
      return ok(res, { message: "No active vendor owners with email addresses found", sent: 0, failed: 0, total: 0 });
    }

    const results = await Promise.allSettled(
      emails.map((to) => sendEmail(adminBroadcastEmail({ to, subject, bodyHtml: html, bodyText: text })))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (sent === 0 && failed > 0) {
      const firstErr = (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason;
      const msg = smtpError(firstErr) ?? "All recipients failed";
      return fail(res, `Email delivery failed: ${msg}`, 502);
    }

    ok(res, { message: "Vendor broadcast email complete", sent, failed, total: emails.length });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailAllRiders(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, html, text } = req.body;

    const riders = await prisma.rider.findMany({
      where: { email: { not: null }, isActive: true },
      select: { email: true },
    });

    const emails = riders.map((r) => r.email!).filter(Boolean);

    if (emails.length === 0) {
      return ok(res, { message: "No active riders with email addresses found", sent: 0, failed: 0, total: 0 });
    }

    const results = await Promise.allSettled(
      emails.map((to) => sendEmail(adminBroadcastEmail({ to, subject, bodyHtml: html, bodyText: text })))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (sent === 0 && failed > 0) {
      const firstErr = (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason;
      const msg = smtpError(firstErr) ?? "All recipients failed";
      return fail(res, `Email delivery failed: ${msg}`, 502);
    }

    ok(res, { message: "Rider broadcast email complete", sent, failed, total: emails.length });
  } catch (err) {
    next(err);
  }
}

export async function listSmsSenderIds(req: Request, res: Response, next: NextFunction) {
  try {
    const senderIds = await getTermiiSenderIds();
    ok(res, { senderIds });
  } catch (err) {
    next(err);
  }
}

export async function requestSmsSenderId(req: Request, res: Response, next: NextFunction) {
  try {
    const { senderId, useCase, company } = req.body;
    const message = await requestTermiiSenderId(senderId, useCase, company);
    ok(res, { message });
  } catch (err) {
    next(err);
  }
}
