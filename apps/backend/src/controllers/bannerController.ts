import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/bannerService";
import { createBannerSchema, updateBannerSchema } from "../validators/bannerValidators";
import { uploadBuffer } from "../services/cloudinaryService";

// ─── Public ───────────────────────────────────────────────────

export async function listPublicBanners(_req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await svc.listBanners(true);
    return ok(res, { banners });
  } catch (err) {
    next(err);
  }
}

// ─── Admin ────────────────────────────────────────────────────

export async function listBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await svc.listBanners(false);
    return ok(res, { data: banners });
  } catch (err) {
    next(err);
  }
}

export async function getBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const banner = await svc.getBanner(req.params.id);
    return ok(res, { data: banner });
  } catch (err: any) {
    if (err.message === "Banner not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createBannerSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const banner = await svc.createBanner(parsed.data);
    return ok(res, { data: banner }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateBannerSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const banner = await svc.updateBanner(req.params.id, parsed.data);
    return ok(res, { data: banner });
  } catch (err: any) {
    if (err.message === "Banner not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function uploadBannerImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) return fail(res, "Image file is required", 400);
    const imageUrl = await uploadBuffer(file.buffer, "godrop/banner-images");
    const banner = await svc.updateBanner(req.params.id, { imageUrl });
    return ok(res, { data: banner });
  } catch (err: any) {
    if (err.message === "Banner not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteBanner(req.params.id);
    return ok(res, { message: "Banner deleted" });
  } catch (err: any) {
    if (err.message === "Banner not found") return fail(res, err.message, 404);
    next(err);
  }
}
