import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as contactService from "../services/contactService";
import { contactSchema } from "../validators/contactValidators";
import { sendEmail, contactAdminNotificationEmail, contactConfirmationEmail } from "../services/emailService";

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);

    const message = await contactService.createContactMessage(parsed.data);

    await Promise.allSettled([
      sendEmail(contactAdminNotificationEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
      })),
      sendEmail(contactConfirmationEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
      })),
    ]);

    return ok(res, { data: { id: message.id }, message: "Your message has been received. We'll get back to you within 24 hours." }, 201);
  } catch (err) {
    next(err);
  }
}
