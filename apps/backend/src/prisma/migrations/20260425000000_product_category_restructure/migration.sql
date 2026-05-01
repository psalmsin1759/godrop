-- AlterTable: add description, isActive, timestamps to ProductCategory
ALTER TABLE "ProductCategory"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "isActive"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
