import { prisma } from "../lib/prisma";

export async function applyPromoCode(code: string, orderType: string, amountKobo: number) {
  const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.isActive) throw new Error("Invalid or expired promo code");

  const now = new Date();
  if (promo.validFrom > now || promo.validUntil < now) {
    throw new Error("Promo code is not currently valid");
  }

  if (promo.orderTypes.length > 0 && !promo.orderTypes.includes(orderType)) {
    throw new Error("Promo code not valid for this order type");
  }

  if (promo.minOrderKobo && amountKobo < promo.minOrderKobo) {
    throw new Error(`Minimum order amount is ₦${promo.minOrderKobo / 100}`);
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    throw new Error("Promo code usage limit reached");
  }

  let discountKobo = 0;
  if (promo.type === "percent") {
    discountKobo = Math.round((amountKobo * promo.value) / 100);
    if (promo.maxDiscount) discountKobo = Math.min(discountKobo, promo.maxDiscount);
  } else {
    discountKobo = Math.min(promo.value, amountKobo);
  }

  return {
    discountKobo,
    description: promo.description,
    validUntil: promo.validUntil,
  };
}

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
