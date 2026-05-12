import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ok } from "../utils/response";

const router = Router();

// Public endpoint — returns platform config needed by the mobile app
router.get("/", async (_req: Request, res: Response) => {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "global" } });
  ok(res, {
    data: {
      coverageRadiusKm: settings?.coverageRadiusKm ?? 15,
    },
  });
});

export default router;
