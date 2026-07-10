import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";
import { sendEmail, vendorAuditLogExportEmail } from "./emailService";

// Hard cap so a huge date range can't produce a multi-hundred-page PDF
const MAX_ENTRIES = 5000;

const LAGOS_TZ = "Africa/Lagos";

function lagosDayStart(date: string): Date {
  // Nigeria has no DST, so a fixed +01:00 offset is always correct
  return new Date(`${date}T00:00:00.000+01:00`);
}

function lagosDayEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999+01:00`);
}

function formatEntryTime(d: Date): string {
  return d.toLocaleString("en-NG", {
    timeZone: LAGOS_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDayLabel(date: string): string {
  return lagosDayStart(date).toLocaleDateString("en-NG", {
    timeZone: LAGOS_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function actionLabel(action: string): string {
  const lower = action.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

interface PdfEntry {
  createdAt: Date;
  action: string;
  entity: string;
  who: string;
}

function buildAuditLogPdf(opts: {
  vendorName: string;
  rangeLabel: string;
  entries: PdfEntry[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).fillColor("#0B1F4A").font("Helvetica-Bold")
      .text(`${opts.vendorName} — Activity Log`);
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#6b7280").font("Helvetica")
      .text(`${opts.rangeLabel} • ${opts.entries.length} ${opts.entries.length === 1 ? "entry" : "entries"} • Times are in Africa/Lagos`);
    doc.moveDown(1);

    for (const entry of opts.entries) {
      // Keep each entry's two lines together across page breaks
      if (doc.y > doc.page.height - doc.page.margins.bottom - 40) doc.addPage();

      doc.fontSize(11).fillColor("#0B1F4A").font("Helvetica-Bold")
        .text(actionLabel(entry.action));
      doc.fontSize(9).fillColor("#6b7280").font("Helvetica")
        .text(`${entry.who} • ${entry.entity} • ${formatEntryTime(entry.createdAt)}`);
      doc.moveDown(0.6);
    }

    doc.end();
  });
}

/**
 * Builds a PDF of a vendor's audit logs between two Lagos-local dates
 * (inclusive) and emails it to the requesting admin. Throws
 * "No activity found" when the range has no entries.
 */
export async function emailVendorAuditLogPdf(opts: {
  vendorId: string;
  adminId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}): Promise<{ email: string; entryCount: number }> {
  const [admin, vendor, logs] = await Promise.all([
    prisma.admin.findUnique({
      where: { id: opts.adminId },
      select: { email: true, firstName: true },
    }),
    prisma.vendor.findUnique({
      where: { id: opts.vendorId },
      select: { name: true },
    }),
    prisma.auditLog.findMany({
      where: {
        vendorId: opts.vendorId,
        createdAt: {
          gte: lagosDayStart(opts.startDate),
          lte: lagosDayEnd(opts.endDate),
        },
      },
      include: {
        admin: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MAX_ENTRIES,
    }),
  ]);

  if (!admin) throw new Error("Admin not found");
  if (!vendor) throw new Error("Vendor not found");
  if (logs.length === 0) throw new Error("No activity found");

  const rangeLabel =
    opts.startDate === opts.endDate
      ? formatDayLabel(opts.startDate)
      : `${formatDayLabel(opts.startDate)} – ${formatDayLabel(opts.endDate)}`;

  const pdf = await buildAuditLogPdf({
    vendorName: vendor.name,
    rangeLabel,
    entries: logs.map((log) => ({
      createdAt: log.createdAt,
      action: log.action,
      entity: log.entity,
      who: log.admin
        ? `${log.admin.firstName} ${log.admin.lastName}`.trim()
        : "System",
    })),
  });

  await sendEmail(
    vendorAuditLogExportEmail({
      firstName: admin.firstName,
      email: admin.email,
      vendorName: vendor.name,
      rangeLabel,
      entryCount: logs.length,
      pdfBase64: pdf.toString("base64"),
      filename: `activity-log_${opts.startDate}_${opts.endDate}.pdf`,
    })
  );

  return { email: admin.email, entryCount: logs.length };
}
