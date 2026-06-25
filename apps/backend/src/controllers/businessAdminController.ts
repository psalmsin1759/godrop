import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import { buildMeta, paginate } from "../utils/pagination";
import * as svc from "../services/businessAdminService";
import { uploadDocument } from "../services/cloudinaryService";
import { BusinessStatus } from "@prisma/client";
import { serializeMoney, serializeMoneyList } from "../utils/currency";

// ─── Me ───────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { password: _pw, ...safe } = req.admin as any;
    return ok(res, { data: safe });
  } catch (err) {
    next(err);
  }
}

export async function getMyBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await svc.getMyBusiness(req.admin!.businessId!);
    return ok(res, { data: business });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function updateMyBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await svc.updateMyBusiness(req.admin!.businessId!, req.body);
    return ok(res, { data: business });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function uploadMyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { field } = req.params as { field: string };
    const allowed = ["cacCertificateUrl", "driversLicenseUrl", "insuranceDocumentUrl", "utilityBillUrl"] as const;
    if (!allowed.includes(field as any)) return fail(res, "Invalid document field", 400);

    if (!req.file) return fail(res, "No file uploaded", 400);
    const url = await uploadDocument(req.file.buffer, "godrop/business-docs");
    const result = await svc.uploadBusinessDocument(req.admin!.businessId!, field as any, url);
    return ok(res, { data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Riders ───────────────────────────────────────────────────

export async function listRiders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listBusinessRiders(req.admin!.businessId!, { page, limit, search: q.search });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function assignRider(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.assignRiderToBusiness(req.admin!.businessId!, req.params.riderId);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    if (err.message === "Rider belongs to another business") return fail(res, err.message, 409);
    next(err);
  }
}

export async function removeRider(req: Request, res: Response, next: NextFunction) {
  try {
    const rider = await svc.removeRiderFromBusiness(req.admin!.businessId!, req.params.riderId);
    return ok(res, { data: rider });
  } catch (err: any) {
    if (err.message === "Rider not found") return fail(res, err.message, 404);
    if (err.message === "Rider does not belong to this business") return fail(res, err.message, 403);
    next(err);
  }
}

export async function getRiderOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.getRiderOrders(req.admin!.businessId!, req.params.riderId, { page, limit });
    const data = result.data.map((order: any) => {
      const { earnings, ...rest } = order;
      // Collapse per-parcel earnings into a single summary for this view.
      const earning =
        earnings && earnings.length > 0
          ? serializeMoney(
              {
                amountKobo: earnings.reduce((s: number, e: any) => s + e.amountKobo, 0),
                status: earnings.every((e: any) => e.status === "SETTLED") ? "SETTLED" : "PENDING",
              },
              ["amount"]
            )
          : null;
      return { ...rest, earning };
    });
    return ok(res, { data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err: any) {
    if (err.message === "Rider not found in this business") return fail(res, err.message, 404);
    next(err);
  }
}

// ─── Wallet ───────────────────────────────────────────────────

export async function getWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const wallet = await svc.getWallet(req.admin!.businessId!);
    return ok(res, { data: serializeMoney(wallet, ["balance"]) });
  } catch (err) {
    next(err);
  }
}

export async function listWalletTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listWalletTransactions(req.admin!.businessId!, { page, limit });
    return ok(res, { data: serializeMoneyList(result.data, ["amount"]), meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

// ─── Team ─────────────────────────────────────────────────────

export async function listTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await svc.listBusinessAdmins(req.admin!.businessId!);
    return ok(res, { data: members });
  } catch (err) {
    next(err);
  }
}

export async function createTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await svc.createBusinessAdmin(req.admin!.businessId!, req.body);
    return ok(res, { data: member }, 201);
  } catch (err: any) {
    if (err.message === "Email already exists") return fail(res, err.message, 409);
    next(err);
  }
}

export async function updateTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await svc.updateBusinessAdmin(req.admin!.businessId!, req.params.memberId, req.body);
    return ok(res, { data: member });
  } catch (err: any) {
    if (err.message === "Admin not found in this business") return fail(res, err.message, 404);
    if (err.message === "Cannot modify the business owner through this endpoint") return fail(res, err.message, 403);
    next(err);
  }
}

// ─── System Admin — Business management ───────────────────────

export async function createBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const b = req.body;

    if (!b.name) return fail(res, "Business name is required", 400);

    // Upload any attached document files to Cloudinary (documents are optional — skip failed uploads)
    const docUrls: Record<string, string> = {};
    if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const docMap: Record<string, string> = {
        cacCertificate: "cacCertificateUrl",
        driversLicense: "driversLicenseUrl",
        insuranceDocument: "insuranceDocumentUrl",
        utilityBill: "utilityBillUrl",
      };
      for (const [fileField, urlField] of Object.entries(docMap)) {
        if (files[fileField]?.[0]) {
          try {
            docUrls[urlField] = await uploadDocument(files[fileField][0].buffer, "godrop/business-docs");
          } catch (uploadErr) {
            console.error(`[createBusiness] Cloudinary upload failed for field "${fileField}":`, uploadErr);
          }
        }
      }
    }

    const toStr = (v: any) => (v && String(v).trim()) || undefined;

    const business = await svc.createBusiness({
      name: b.name,
      email: toStr(b.email),
      phone: toStr(b.phone),
      address: toStr(b.address),
      cacRegistrationNumber: toStr(b.cacRegistrationNumber),
      tin: toStr(b.tin),
      yearEstablished: b.yearEstablished ? Number(b.yearEstablished) : undefined,
      ownerFullName: toStr(b.ownerFullName),
      ownerPhoneNumber: toStr(b.ownerPhoneNumber),
      ownerEmail: toStr(b.ownerEmail),
      ownerNIN: toStr(b.ownerNIN),
      ownerBVN: toStr(b.ownerBVN),
      serviceAreas: b.serviceAreas
        ? (Array.isArray(b.serviceAreas) ? b.serviceAreas : [b.serviceAreas])
        : [],
      bankName: toStr(b.bankName),
      accountName: toStr(b.accountName),
      accountNumber: toStr(b.accountNumber),
      ...docUrls,
    });

    // Create owner if credentials supplied
    if (b.ownerFirstName && b.ownerLastName && b.ownerPassword) {
      await svc.createBusinessOwner(business.id, {
        firstName: b.ownerFirstName,
        lastName: b.ownerLastName,
        email: toStr(b.ownerEmail) ?? `owner@${b.name.toLowerCase().replace(/\s+/g, "")}.biz`,
        password: b.ownerPassword,
      });
    }

    return ok(res, { data: business }, 201);
  } catch (err: any) {
    if (err.code === "P2002" || err.message?.includes("Unique constraint") || err.message === "Email already exists")
      return fail(res, "Email already in use", 409);
    console.error("[createBusiness]", err);
    next(err);
  }
}

export async function listBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listBusinesses({
      search: q.search,
      status: q.status as BusinessStatus | undefined,
      page,
      limit,
    });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function getBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await svc.getBusiness(req.params.id);
    return ok(res, { data: business });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function updateBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await svc.updateBusiness(req.params.id, req.body);
    return ok(res, { data: business });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createBusinessOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await svc.createBusinessOwner(req.params.id, req.body);
    return ok(res, { data: admin }, 201);
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    if (err.message === "Email already exists") return fail(res, err.message, 409);
    next(err);
  }
}

export async function listBusinessRidersAsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listBusinessRiders(req.params.id, { page, limit, search: q.search });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function listBusinessWalletTransactionsAsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as any;
    const { page, limit } = paginate(q.page, q.limit);
    const result = await svc.listWalletTransactions(req.params.id, { page, limit });
    return ok(res, { data: result.data, meta: buildMeta(result.page, result.limit, result.total) });
  } catch (err) {
    next(err);
  }
}

export async function listBusinessTeamAsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await svc.listBusinessAdmins(req.params.id);
    return ok(res, { data: members });
  } catch (err) {
    next(err);
  }
}

export async function uploadBusinessDocumentAsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, field } = req.params;
    const allowed = ["cacCertificateUrl", "driversLicenseUrl", "insuranceDocumentUrl", "utilityBillUrl"] as const;
    if (!allowed.includes(field as any)) return fail(res, "Invalid document field", 400);
    if (!req.file) return fail(res, "No file uploaded", 400);
    const url = await uploadDocument(req.file.buffer, "godrop/business-docs");
    const result = await svc.uploadBusinessDocument(id, field as any, url);
    return ok(res, { data: result });
  } catch (err: any) {
    if (err.message === "Business not found") return fail(res, err.message, 404);
    next(err);
  }
}
