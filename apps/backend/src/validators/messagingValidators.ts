import { z } from "zod";

const emailBase = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
});

export const sendEmailSingleSchema = emailBase.extend({
  to: z.string().email(),
});

export const sendEmailBatchSchema = emailBase.extend({
  emails: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().email()).min(1).max(500)),
});

export const sendEmailAllCustomersSchema = emailBase;
