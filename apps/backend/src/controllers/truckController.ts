import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import * as pricingService from "../services/pricingService";
import * as orderService from "../services/orderService";
import { ok, created, fail } from "../utils/response";
import { Prisma } from "@prisma/client";

// ─── Apartment Types (public) ─────────────────────────────────

export async function listApartmentTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.apartmentType.findMany({
      where: { isActive: true },
      orderBy: { priceKobo: "asc" },
    });
    ok(res, { types });
  } catch (err) {
    next(err);
  }
}

// ─── Apartment Types (admin) ──────────────────────────────────

export async function adminListApartmentTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.apartmentType.findMany({ orderBy: { priceKobo: "asc" } });
    ok(res, { types });
  } catch (err) {
    next(err);
  }
}

export async function createApartmentType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.apartmentType.create({ data: req.body });
    created(res, { type });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return fail(res, "An apartment type with that name already exists", 409);
    }
    next(err);
  }
}

export async function updateApartmentType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.apartmentType.update({
      where: { id: req.params.id },
      data: req.body,
    });
    ok(res, { type });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return fail(res, "Apartment type not found", 404);
      if (err.code === "P2002") return fail(res, "An apartment type with that name already exists", 409);
    }
    next(err);
  }
}

export async function deleteApartmentType(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.apartmentType.delete({ where: { id: req.params.id } });
    ok(res, {});
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return fail(res, "Apartment type not found", 404);
    }
    next(err);
  }
}

// ─── Pricing Config (admin) ───────────────────────────────────

async function getOrInitConfig() {
  return prisma.truckPricingConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", perKmKobo: 0, perLoaderKobo: 0 },
  });
}

export async function setPerKmCost(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await prisma.truckPricingConfig.upsert({
      where: { id: "singleton" },
      update: { perKmKobo: req.body.perKmKobo },
      create: { id: "singleton", perKmKobo: req.body.perKmKobo, perLoaderKobo: 0 },
    });
    ok(res, { config });
  } catch (err) {
    next(err);
  }
}

export async function setPerLoaderCost(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await prisma.truckPricingConfig.upsert({
      where: { id: "singleton" },
      update: { perLoaderKobo: req.body.perLoaderKobo },
      create: { id: "singleton", perKmKobo: 0, perLoaderKobo: req.body.perLoaderKobo },
    });
    ok(res, { config });
  } catch (err) {
    next(err);
  }
}

// ─── Pricing Summary (public) ─────────────────────────────────

export async function getPricingSummary(_req: Request, res: Response, next: NextFunction) {
  try {
    const [apartmentTypes, config] = await Promise.all([
      prisma.apartmentType.findMany({ where: { isActive: true }, orderBy: { priceKobo: "asc" } }),
      getOrInitConfig(),
    ]);
    ok(res, {
      apartmentTypes,
      perKmKobo: config.perKmKobo,
      perLoaderKobo: config.perLoaderKobo,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Quote ────────────────────────────────────────────────────

export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { apartmentTypeId, numLoaders = 0, pickup, dropoff, stops } = req.body;

    const [apartmentType, config] = await Promise.all([
      prisma.apartmentType.findUnique({ where: { id: apartmentTypeId } }),
      getOrInitConfig(),
    ]);
    if (!apartmentType) return fail(res, "Apartment type not found", 404);

    const result = pricingService.truckQuote(
      apartmentType,
      config.perKmKobo,
      config.perLoaderKobo,
      pickup,
      dropoff,
      numLoaders,
      stops
    );
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── Book ─────────────────────────────────────────────────────

export async function bookTruck(req: Request, res: Response, next: NextFunction) {
  try {
    const { apartmentTypeId, numLoaders = 0, pickup, dropoff, stops, scheduledAt, paymentMethod, notes } = req.body;

    const [apartmentType, config] = await Promise.all([
      prisma.apartmentType.findUnique({ where: { id: apartmentTypeId } }),
      getOrInitConfig(),
    ]);
    if (!apartmentType) return fail(res, "Apartment type not found", 404);

    const { priceBreakdown, estimatedMinutes } = pricingService.truckQuote(
      apartmentType,
      config.perKmKobo,
      config.perLoaderKobo,
      pickup,
      dropoff,
      numLoaders,
      stops
    );

    const order = await orderService.placeTruckOrder(req.user!.id, {
      apartmentTypeId,
      numLoaders,
      pickup,
      dropoff,
      stops,
      scheduledAt,
      paymentMethod,
      notes,
      priceBreakdown,
      estimatedMinutes,
    });

    created(res, { order });
  } catch (err) {
    next(err);
  }
}

// ─── Truck Types (vehicle — legacy CRUD) ─────────────────────

export async function listTruckTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.truckType.findMany({ where: { isActive: true } });
    ok(res, { types });
  } catch (err) {
    next(err);
  }
}

export async function createTruckType(req: Request, res: Response, next: NextFunction) {
  try {
    const truckType = await prisma.truckType.create({ data: req.body });
    created(res, { truckType });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return fail(res, "A truck type with that name already exists", 409);
    }
    next(err);
  }
}

export async function updateTruckType(req: Request, res: Response, next: NextFunction) {
  try {
    const truckType = await prisma.truckType.update({
      where: { id: req.params.id },
      data: req.body,
    });
    ok(res, { truckType });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return fail(res, "Truck type not found", 404);
      if (err.code === "P2002") return fail(res, "A truck type with that name already exists", 409);
    }
    next(err);
  }
}

export async function deleteTruckType(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.truckType.delete({ where: { id: req.params.id } });
    ok(res, {});
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return fail(res, "Truck type not found", 404);
    }
    next(err);
  }
}
