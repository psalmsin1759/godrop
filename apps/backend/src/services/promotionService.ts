import { prisma } from "../lib/prisma";
import { CreatePromotionInput, UpdatePromotionInput } from "../validators/promotionAdminValidators";

export class InvalidCouponError extends Error {}

// Coupons discount the DELIVERY FEE only, never the rider's cut of it — see
// the doc comment on the Promotion model in schema.prisma. `orderValueKobo`
// (cart subtotal for food/store orders, total booking cost for parcel/truck)
// is used only to check `minOrderKobo`; the discount itself is always
// computed off — and capped at — `deliveryFeeKobo`.
export async function applyPromoCode(opts: {
  code: string;
  orderType: string;
  deliveryFeeKobo: number;
  orderValueKobo: number;
}) {
  const { code, orderType, deliveryFeeKobo, orderValueKobo } = opts;
  const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.isActive) throw new InvalidCouponError("Invalid or expired promo code");

  const now = new Date();
  if (promo.validFrom > now || promo.validUntil < now) {
    throw new InvalidCouponError("Promo code is not currently valid");
  }

  if (promo.orderTypes.length > 0 && !promo.orderTypes.includes(orderType)) {
    throw new InvalidCouponError("Promo code not valid for this order type");
  }

  if (promo.minOrderKobo && orderValueKobo < promo.minOrderKobo) {
    throw new InvalidCouponError(`Minimum order amount is ₦${promo.minOrderKobo / 100}`);
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    throw new InvalidCouponError("Promo code usage limit reached");
  }

  let discountKobo = 0;
  if (promo.type === "percent") {
    discountKobo = Math.round((deliveryFeeKobo * promo.value) / 100);
    if (promo.maxDiscount) discountKobo = Math.min(discountKobo, promo.maxDiscount);
  } else {
    discountKobo = promo.value;
  }
  // Never discount more than the delivery fee itself.
  discountKobo = Math.min(discountKobo, deliveryFeeKobo);

  return {
    promotionId: promo.id,
    discountKobo,
    description: promo.description,
    validUntil: promo.validUntil,
  };
}

export async function incrementPromotionUsage(id: string) {
  await prisma.promotion.update({ where: { id }, data: { usageCount: { increment: 1 } } });
}

// ─── Admin (coupon management) ────────────────────────────────

export async function listPromotions() {
  return prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getPromotion(id: string) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new Error("Promotion not found");
  const stats = await prisma.order.aggregate({
    where: { promotionId: id },
    _count: true,
    _sum: { discountKobo: true },
  });
  return {
    ...promo,
    ordersRedeemed: stats._count,
    totalDiscountKobo: stats._sum.discountKobo ?? 0,
  };
}

export async function createPromotion(data: CreatePromotionInput) {
  const existing = await prisma.promotion.findUnique({ where: { code: data.code } });
  if (existing) throw new Error("A coupon with this code already exists");
  return prisma.promotion.create({ data });
}

export async function updatePromotion(id: string, data: UpdatePromotionInput) {
  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) throw new Error("Promotion not found");
  if (data.code && data.code !== existing.code) {
    const codeTaken = await prisma.promotion.findUnique({ where: { code: data.code } });
    if (codeTaken) throw new Error("A coupon with this code already exists");
  }
  return prisma.promotion.update({ where: { id }, data });
}

export async function deletePromotion(id: string) {
  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) throw new Error("Promotion not found");
  await prisma.promotion.delete({ where: { id } });
}
