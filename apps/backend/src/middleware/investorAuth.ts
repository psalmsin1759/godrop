import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { fail } from "../utils/response";

interface InvestorJwtPayload {
  investorId: string;
  type: string;
}

export async function requireInvestorAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return fail(res, "Unauthorized", 401);
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as InvestorJwtPayload;
    if (payload.type !== "investor" || !payload.investorId) {
      return fail(res, "Unauthorized", 401);
    }
    const investor = await prisma.investor.findUnique({ where: { id: payload.investorId } });
    if (!investor || investor.status !== "ACTIVE") return fail(res, "Unauthorized", 401);
    req.investor = investor;
    next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
}
