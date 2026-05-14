import { Request, Response, NextFunction } from "express";
import { ok, fail } from "../utils/response";
import * as svc from "../services/heroService";
import { createHeroSchema, updateHeroSchema } from "../validators/heroValidators";
import { uploadBuffer } from "../services/cloudinaryService";

// ─── Public ───────────────────────────────────────────────────

export async function listPublicHeroes(req: Request, res: Response, next: NextFunction) {
  try {
    const heroes = await svc.listHeroes(true);
    return ok(res, { data: heroes });
  } catch (err) {
    next(err);
  }
}

// ─── Admin ────────────────────────────────────────────────────

export async function listHeroes(req: Request, res: Response, next: NextFunction) {
  try {
    const heroes = await svc.listHeroes(false);
    return ok(res, { data: heroes });
  } catch (err) {
    next(err);
  }
}

export async function getHero(req: Request, res: Response, next: NextFunction) {
  try {
    const hero = await svc.getHero(req.params.id);
    return ok(res, { data: hero });
  } catch (err: any) {
    if (err.message === "Hero not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function createHero(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createHeroSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const hero = await svc.createHero(parsed.data);
    return ok(res, { data: hero }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateHero(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateHeroSchema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message, 400);
    const hero = await svc.updateHero(req.params.id, parsed.data);
    return ok(res, { data: hero });
  } catch (err: any) {
    if (err.message === "Hero not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function uploadHeroImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) return fail(res, "Image file is required", 400);
    const imageUrl = await uploadBuffer(file.buffer, "godrop/hero-images");
    const hero = await svc.updateHeroImage(req.params.id, imageUrl);
    return ok(res, { data: hero });
  } catch (err: any) {
    if (err.message === "Hero not found") return fail(res, err.message, 404);
    next(err);
  }
}

export async function deleteHero(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteHero(req.params.id);
    return ok(res, { message: "Hero deleted" });
  } catch (err: any) {
    if (err.message === "Hero not found") return fail(res, err.message, 404);
    next(err);
  }
}
