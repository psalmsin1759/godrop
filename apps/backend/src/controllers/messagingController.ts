import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../services/emailService";
import { ok, fail } from "../utils/response";

export async function sendEmailSingle(req: Request, res: Response, next: NextFunction) {
  try {
    const { to, subject, html, text } = req.body;
    await sendEmail({ to, subject, html, text });
    ok(res, { message: `Email sent to ${to}` });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { emails, subject, html, text } = req.body;

    const results = await Promise.allSettled(
      emails.map((to: string) => sendEmail({ to, subject, html, text }))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

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

    const results = await Promise.allSettled(
      emails.map((to) => sendEmail({ to, subject, html, text }))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    ok(res, { message: "Broadcast email complete", sent, failed, total: emails.length });
  } catch (err) {
    next(err);
  }
}
