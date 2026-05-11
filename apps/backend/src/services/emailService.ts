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

// ─── Shared layout wrapper ────────────────────────────────────

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Godrop</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:12px;padding:10px 22px;">
                    <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Go<span style="color:#fde68a;">drop</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.07);overflow:hidden;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 8px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Godrop Technologies Ltd · Lagos, Nigeria
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
                Questions? <a href="mailto:support@godrop.ng" style="color:#f97316;text-decoration:none;">support@godrop.ng</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function cardHeader(title: string, accentColor = "#f97316"): string {
  return `<div style="background:${accentColor};padding:28px 32px 24px;">
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;line-height:1.3;">${title}</h1>
  </div>`;
}

function cardBody(html: string): string {
  return `<div style="padding:28px 32px;">${html}</div>`;
}

function ctaButton(label: string, url: string, color = "#f97316"): string {
  return `<div style="margin-top:24px;">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">${label}</a>
  </div>`;
}

function infoTable(rows: Array<[string, string]>): string {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:9px 12px;font-size:13px;font-weight:600;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:9px 12px;font-size:13px;color:#111827;">${value}</td>
    </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin-top:20px;border-collapse:collapse;">
    ${rowsHtml}
  </table>`;
}

// ─── Templates ────────────────────────────────────────────────

export function vendorWelcomeEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/vendor/login`;
  const html = emailLayout(
    cardHeader("Application Received — Under Review") +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Thank you for applying to join <strong>Godrop</strong> as a vendor. We've received your application for
        <strong>${opts.vendorName}</strong> and it's now under review.
      </p>
      <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:4px;padding:14px 16px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">What happens next?</p>
        <p style="margin:6px 0 0;font-size:13px;color:#92400e;line-height:1.5;">
          Our team will review your documents and get back to you within <strong>1–2 business days</strong>.
          You'll receive an email with the decision.
        </p>
      </div>
      <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:4px;padding:14px 16px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">You can get started now</p>
        <p style="margin:6px 0 0;font-size:13px;color:#1e40af;line-height:1.5;">
          While we review your application, you can already <strong>log in to your dashboard</strong> and
          start uploading your products or menu. Your store will only become visible to customers once
          your application is approved.
        </p>
      </div>
      ${ctaButton("Log In & Upload Products", loginUrl, "#3b82f6")}
      ${infoTable([
        ["Business Name", opts.vendorName],
        ["Email", opts.email],
        ["Status", "Under Review"],
      ])}
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
        If you have any questions in the meantime, please don't hesitate to reach out to us at
        <a href="mailto:support@godrop.ng" style="color:#f97316;text-decoration:none;">support@godrop.ng</a>.
      </p>
    `)
  );

  return {
    to: opts.email,
    subject: `Application received — ${opts.vendorName} | Godrop`,
    html,
    text: `Hi ${opts.firstName}, your vendor application for ${opts.vendorName} has been received. Our team will review it within 1–2 business days.\n\nYou can already log in and start uploading your products — they will only be visible to customers once your application is approved.\n\nLogin: ${loginUrl}`,
  };
}

export function vendorApprovedEmail(opts: {
  firstName: string;
  vendorName: string;
  email: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/vendor/login`;
  const html = emailLayout(
    cardHeader("Your Store is Live!", "#16a34a") +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Congratulations! Your vendor application for <strong>${opts.vendorName}</strong> has been
        <strong style="color:#16a34a;">approved</strong>. Your store is now live and visible to customers on Godrop.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Log in to your vendor dashboard to set up your menu, manage orders, and start earning.
      </p>
      ${ctaButton("Open Vendor Dashboard", loginUrl, "#16a34a")}
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
        Need help? Contact us at <a href="mailto:support@godrop.ng" style="color:#f97316;text-decoration:none;">support@godrop.ng</a>.
      </p>
    `)
  );

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
  const html = emailLayout(
    cardHeader("Application Update", "#dc2626") +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        We regret to inform you that your vendor application for <strong>${opts.vendorName}</strong>
        could not be approved at this time.
      </p>
      ${opts.reason
        ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;padding:14px 16px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#991b1b;"><strong>Reason:</strong> ${opts.reason}</p>
          </div>`
        : ""}
      <p style="margin:16px 0;font-size:14px;color:#374151;line-height:1.6;">
        If you believe this was an error or would like to reapply, please reply to this email or contact us at
        <a href="mailto:support@godrop.ng" style="color:#f97316;text-decoration:none;">support@godrop.ng</a>.
      </p>
    `)
  );

  return {
    to: opts.email,
    subject: `Godrop vendor application update — ${opts.vendorName}`,
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
  const html = emailLayout(
    cardHeader(`You've been added to ${opts.vendorName}`) +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        You have been added as a <strong>${opts.role}</strong> for <strong>${opts.vendorName}</strong> on Godrop.
      </p>
      ${infoTable([
        ["Email", opts.email],
        ["Role", opts.role],
        ["Temporary Password", `<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${opts.temporaryPassword}</code>`],
      ])}
      <p style="margin:16px 0;font-size:13px;color:#6b7280;line-height:1.6;">
        Please log in and change your password immediately.
      </p>
      ${ctaButton("Log In to Dashboard", loginUrl)}
    `)
  );

  return {
    to: opts.email,
    subject: `You've been added to ${opts.vendorName} on Godrop`,
    html,
    text: `Hi ${opts.firstName}, you've been added to ${opts.vendorName} as ${opts.role}. Login at ${loginUrl} with password: ${opts.temporaryPassword}`,
  };
}

export function systemAdminInviteEmail(opts: {
  firstName: string;
  email: string;
  role: string;
  temporaryPassword: string;
}): EmailOptions {
  const loginUrl = `${process.env.DASHBOARD_URL ?? "https://dashboard.godrop.ng"}/admin/login`;
  const html = emailLayout(
    cardHeader("You've been added as a Godrop Admin") +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        You have been added as a <strong>${opts.role.replace("_", " ")}</strong> on the Godrop Operations Dashboard.
        Use the credentials below to log in for the first time.
      </p>
      ${infoTable([
        ["Email", opts.email],
        ["Role", opts.role.replace("_", " ")],
        ["Temporary Password", `<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${opts.temporaryPassword}</code>`],
      ])}
      <p style="margin:16px 0;font-size:13px;color:#6b7280;line-height:1.6;">
        Please log in and change your password immediately.
      </p>
      ${ctaButton("Log In to Dashboard", loginUrl)}
    `)
  );

  return {
    to: opts.email,
    subject: "You've been added to Godrop Admin Dashboard",
    html,
    text: `Hi ${opts.firstName}, you've been added as ${opts.role} on the Godrop Operations Dashboard. Login at ${loginUrl} with password: ${opts.temporaryPassword}. Please change your password after logging in.`,
  };
}

export function adminNewVendorApplicationEmail(opts: {
  adminFirstName: string;
  adminEmail: string;
  vendorName: string;
  vendorType: string;
  ownerName: string;
  ownerEmail: string;
  vendorAddress: string;
  submittedAt: string;
  reviewUrl: string;
  documents: { businessRegistration: boolean; governmentId: boolean; utilityBill: boolean };
}): EmailOptions {
  const docRow = (label: string, uploaded: boolean) =>
    `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#374151;">${label}</td>
      <td style="padding:8px 12px;font-size:13px;">
        <span style="display:inline-flex;align-items:center;gap:4px;${uploaded ? "color:#16a34a;background:#e8faf2;" : "color:#dc2626;background:#fef2f2;"}padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">
          ${uploaded ? "✓ Uploaded" : "✗ Missing"}
        </span>
      </td>
    </tr>`;

  const html = emailLayout(
    cardHeader("New Vendor Application Submitted") +
    cardBody(`
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${opts.adminFirstName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        A new vendor has submitted their application on Godrop and is awaiting your review.
      </p>
      ${infoTable([
        ["Business Name", opts.vendorName],
        ["Type", opts.vendorType],
        ["Owner", opts.ownerName],
        ["Owner Email", opts.ownerEmail],
        ["Address", opts.vendorAddress],
        ["Submitted", opts.submittedAt],
      ])}
      <p style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#374151;">Documents Submitted</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;">
        ${docRow("Business Registration Certificate", opts.documents.businessRegistration)}
        ${docRow("Government-Issued ID (Owner)", opts.documents.governmentId)}
        ${docRow("Utility Bill", opts.documents.utilityBill)}
      </table>
      ${ctaButton("Review Application", opts.reviewUrl)}
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
        This notification was sent because you are listed as a vendor review recipient on Godrop.
        You can manage your notification preferences in the admin dashboard.
      </p>
    `)
  );

  return {
    to: opts.adminEmail,
    subject: `New vendor application: ${opts.vendorName} — Godrop`,
    html,
    text: `New vendor application from ${opts.vendorName} (${opts.vendorType}). Owner: ${opts.ownerName} <${opts.ownerEmail}>. Submitted: ${opts.submittedAt}. Review at: ${opts.reviewUrl}`,
  };
}
