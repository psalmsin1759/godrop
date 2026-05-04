-- CreateTable
CREATE TABLE "ParcelVehicleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "baseFeeKobo" INTEGER NOT NULL,
    "perKmKobo" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelVehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParcelVehicleType_name_key" ON "ParcelVehicleType"("name");

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "parcelVehicleTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_parcelVehicleTypeId_fkey" FOREIGN KEY ("parcelVehicleTypeId") REFERENCES "ParcelVehicleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
