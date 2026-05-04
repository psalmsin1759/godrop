import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import * as pricingService from "../services/pricingService";
import * as orderService from "../services/orderService";
import { ok, created, fail } from "../utils/response";

// ─── Vehicle Types (public) ───────────────────────────────────

export async function listVehicleTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.parcelVehicleType.findMany({
      where: { isActive: true },
      orderBy: { baseFeeKobo: "asc" },
    });
    ok(res, { types });
  } catch (err) {
    next(err);
  }
}

export async function getVehicleType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.parcelVehicleType.findUnique({ where: { id: req.params.id } });
    if (!type) return fail(res, "Vehicle type not found", 404);
    ok(res, { type });
  } catch (err) {
    next(err);
  }
}

// ─── Vehicle Types (admin) ────────────────────────────────────

export async function adminListVehicleTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.parcelVehicleType.findMany({ orderBy: { baseFeeKobo: "asc" } });
    ok(res, { types });
  } catch (err) {
    next(err);
  }
}

export async function createVehicleType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.parcelVehicleType.create({ data: req.body });
    created(res, { type });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return fail(res, "A vehicle type with that name already exists", 409);
    }
    next(err);
  }
}

export async function updateVehicleType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.parcelVehicleType.update({
      where: { id: req.params.id },
      data: req.body,
    });
    ok(res, { type });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return fail(res, "Vehicle type not found", 404);
      if (err.code === "P2002") return fail(res, "A vehicle type with that name already exists", 409);
    }
    next(err);
  }
}

export async function deleteVehicleType(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.parcelVehicleType.delete({ where: { id: req.params.id } });
    ok(res, {});
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return fail(res, "Vehicle type not found", 404);
    }
    next(err);
  }
}

// ─── Quote ────────────────────────────────────────────────────

export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { pickup, dropoff, vehicleTypeId } = req.body;

    let vehicleType: { baseFeeKobo: number; perKmKobo: number } | undefined;
    if (vehicleTypeId) {
      const found = await prisma.parcelVehicleType.findFirst({
        where: { id: vehicleTypeId, isActive: true },
        select: { baseFeeKobo: true, perKmKobo: true },
      });
      if (!found) return fail(res, "Vehicle type not found or inactive", 404);
      vehicleType = found;
    }

    const result = pricingService.parcelQuote(pickup, dropoff, vehicleType);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── Order ────────────────────────────────────────────────────

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.placeParcelOrder(req.user!.id, req.body);
    created(res, { order });
  } catch (err: any) {
    if (err.message === "Vehicle type not found or inactive") {
      return fail(res, err.message, 404);
    }
    next(err);
  }
}
