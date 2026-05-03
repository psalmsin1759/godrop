import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { fail } from "../utils/response";

interface RiderJwtPayload {
  riderId: string;
  type: "rider";
}

export async function requireRiderAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return fail(res, "Unauthorized", 401);

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as RiderJwtPayload;
    if (payload.type !== "rider") return fail(res, "Unauthorized", 401);

    const rider = await prisma.rider.findUnique({ where: { id: payload.riderId } });
    if (!rider || !rider.isActive) return fail(res, "Unauthorized", 401);

    req.rider = rider;
    next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}
