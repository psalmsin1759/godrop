/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TruckType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductCategory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Rider" ALTER COLUMN "isAvailable" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "TruckType_name_key" ON "TruckType"("name");
