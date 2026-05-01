-- CreateTable
CREATE TABLE "ApartmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceKobo" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckPricingConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "perKmKobo" INTEGER NOT NULL DEFAULT 0,
    "perLoaderKobo" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TruckPricingConfig_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "apartmentTypeId" TEXT,
                    ADD COLUMN "numLoaders" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentType_name_key" ON "ApartmentType"("name");

-- CreateIndex
CREATE INDEX "Order_apartmentTypeId_idx" ON "Order"("apartmentTypeId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_apartmentTypeId_fkey"
    FOREIGN KEY ("apartmentTypeId") REFERENCES "ApartmentType"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
