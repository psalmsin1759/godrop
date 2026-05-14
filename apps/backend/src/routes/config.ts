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
      paystackPublicKey: settings?.paystackPublicKey ?? process.env.PAYSTACK_PUBLIC_KEY ?? "",
      standardDeliveryFeeKobo: settings?.standardDeliveryFeeKobo ?? 75000,
      serviceChargeKobo: settings?.serviceChargeKobo ?? 25000,
      costPerKmKobo: settings?.costPerKmKobo ?? 10000,
    },
  });
});

// Public endpoint — returns vendor-specific payment options for the customer app
router.get("/vendor/:id/payment-options", async (req: Request, res: Response) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id }, select: { cashOnDeliveryEnabled: true, isActive: true } });
  if (!vendor || !vendor.isActive) return ok(res, { cashOnDeliveryEnabled: false });
  ok(res, { cashOnDeliveryEnabled: vendor.cashOnDeliveryEnabled });
});

export default router;
