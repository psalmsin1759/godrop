-- AlterTable: Banner gets admin-editable text content for the customer app's
-- home-screen promo card; imageUrl becomes optional since this style of
-- banner is icon+gradient, not image-based.
ALTER TABLE "Banner" ALTER COLUMN "imageUrl" DROP NOT NULL;
ALTER TABLE "Banner" ADD COLUMN "badge" TEXT;
ALTER TABLE "Banner" ADD COLUMN "ctaLabel" TEXT;

-- AlterTable: Order gains an optional link to the coupon (Promotion) used at
-- checkout. deliveryFeeKobo/ParcelDropoff.deliveryFeeKobo are untouched by
-- this migration and must stay the source of truth for rider earnings.
ALTER TABLE "Order" ADD COLUMN "promotionId" TEXT;

-- CreateIndex
CREATE INDEX "Order_promotionId_idx" ON "Order"("promotionId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
