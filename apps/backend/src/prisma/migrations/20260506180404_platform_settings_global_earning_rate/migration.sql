/*
  Warnings:

  - You are about to drop the column `earningRate` on the `Rider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Rider" DROP COLUMN "earningRate";

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "riderEarningRate" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
