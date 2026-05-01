import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const provider = process.env.EMAIL_PROVIDER ?? "ethereal";

  if (provider === "mailtrap") {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST ?? "sandbox.smtp.mailtrap.io",
      port: Number(process.env.MAILTRAP_PORT ?? 2525),
      auth: {
        user: process.env.MAILTRAP_USER!,
        pass: process.env.MAILTRAP_PASS!,
      },
    });
  } else {
    // Ethereal — creates a free disposable test account and logs the preview URL
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log(`[email] Ethereal test account: ${testAccount.user}`);
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME ?? "Godrop"}" <${process.env.EMAIL_FROM_ADDRESS ?? "noreply@godrop.ng"}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (process.env.EMAIL_PROVIDER !== "mailtrap") {
    console.log(`[email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

// ─── Templates ────────────────────────────────────────────────

export function vendorWelcomeEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
  temporaryPassword?: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/vendor/login`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#1a1a1a">Welcome to Godrop, ${opts.firstName}!</h2>
      <p>Your vendor application for <strong>${opts.vendorName}</strong> has been received and is under review.</p>
      <p>You can log in to your vendor dashboard to manage your store while we review your application.</p>
      <table style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;width:100%">
        <tr><td><strong>Email:</strong></td><td>${opts.email}</td></tr>
        ${opts.temporaryPassword ? `<tr><td><strong>Temporary Password:</strong></td><td><code>${opts.temporaryPassword}</code></td></tr>` : ""}
      </table>
      <p style="margin-top:24px">
        <a href="${loginUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Go to Vendor Dashboard
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">
        You will receive another email once your application is approved.<br>
        Questions? Reply to this email.
      </p>
    </div>
  `;
  return {
    to: opts.email,
    subject: `Welcome to Godrop — ${opts.vendorName} application received`,
    html,
    text: `Welcome ${opts.firstName}! Your vendor application for ${opts.vendorName} has been received. Login at ${loginUrl}`,
  };
}

export function vendorApprovedEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/vendor/login`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#16a34a">🎉 Congratulations — you're approved!</h2>
      <p>Hi ${opts.firstName}, your vendor <strong>${opts.vendorName}</strong> has been approved on Godrop.</p>
      <p>Your store is now live and visible to customers. Log in to start managing orders.</p>
      <p style="margin-top:24px">
        <a href="${loginUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Open Vendor Dashboard
        </a>
      </p>
    </div>
  `;
  return {
    to: opts.email,
    subject: `Your Godrop store is live — ${opts.vendorName}`,
    html,
    text: `Hi ${opts.firstName}, ${opts.vendorName} has been approved on Godrop! Login at ${loginUrl}`,
  };
}

export function vendorRejectedEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
  reason?: string;
}): EmailOptions {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#dc2626">Application update — ${opts.vendorName}</h2>
      <p>Hi ${opts.firstName}, unfortunately your vendor application could not be approved at this time.</p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
      <p>Please reply to this email if you have questions or wish to reapply.</p>
    </div>
  `;
  return {
    to: opts.email,
    subject: `Your Godrop application — ${opts.vendorName}`,
    html,
    text: `Hi ${opts.firstName}, your application for ${opts.vendorName} was not approved. ${opts.reason ?? ""}`,
  };
}

export function vendorTeamInviteEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
  role: string;
  temporaryPassword: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/vendor/login`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2>You've been added to ${opts.vendorName} on Godrop</h2>
      <p>Hi ${opts.firstName}, you have been added as a <strong>${opts.role}</strong>.</p>
      <table style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;width:100%">
        <tr><td><strong>Email:</strong></td><td>${opts.email}</td></tr>
        <tr><td><strong>Temporary Password:</strong></td><td><code>${opts.temporaryPassword}</code></td></tr>
      </table>
      <p>Please change your password after your first login.</p>
      <p style="margin-top:24px">
        <a href="${loginUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Log In
        </a>
      </p>
    </div>
  `;
  return {
    to: opts.email,
    subject: `You've been added to ${opts.vendorName} on Godrop`,
    html,
    text: `Hi ${opts.firstName}, you've been added to ${opts.vendorName} as ${opts.role}. Login at ${loginUrl} with password: ${opts.temporaryPassword}`,
  };
}
