-- CreateTable
CREATE TABLE "ParcelDropoff" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "packageDescription" TEXT,
    "weightKg" DOUBLE PRECISION,
    "sizeCategory" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT NOT NULL,
    "deliveryFeeKobo" INTEGER NOT NULL,
    "earningKobo" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "failureReason" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelDropoff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParcelDropoff_orderId_idx" ON "ParcelDropoff"("orderId");

-- AddForeignKey
ALTER TABLE "ParcelDropoff" ADD CONSTRAINT "ParcelDropoff_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex (RiderEarning.orderId is no longer unique — multiple per-parcel earnings per order)
DROP INDEX IF EXISTS "RiderEarning_orderId_key";

-- AlterTable
ALTER TABLE "RiderEarning" ADD COLUMN "parcelDropoffId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RiderEarning_parcelDropoffId_key" ON "RiderEarning"("parcelDropoffId");

-- CreateIndex
CREATE INDEX "RiderEarning_orderId_idx" ON "RiderEarning"("orderId");

-- AddForeignKey
ALTER TABLE "RiderEarning" ADD CONSTRAINT "RiderEarning_parcelDropoffId_fkey" FOREIGN KEY ("parcelDropoffId") REFERENCES "ParcelDropoff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
