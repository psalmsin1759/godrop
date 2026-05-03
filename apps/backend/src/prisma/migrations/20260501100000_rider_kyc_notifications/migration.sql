-- CreateEnum
CREATE TYPE "RiderKycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- AlterTable Rider
ALTER TABLE "Rider" ADD COLUMN "email" TEXT;
ALTER TABLE "Rider" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Rider" ADD COLUMN "gender" TEXT;
ALTER TABLE "Rider" ADD COLUMN "streetAddress" TEXT;
ALTER TABLE "Rider" ADD COLUMN "city" TEXT;
ALTER TABLE "Rider" ADD COLUMN "state" TEXT;
ALTER TABLE "Rider" ADD COLUMN "landmark" TEXT;
ALTER TABLE "Rider" ADD COLUMN "vehicleColor" TEXT;
ALTER TABLE "Rider" ADD COLUMN "vehicleModel" TEXT;
ALTER TABLE "Rider" ADD COLUMN "vehicleYear" INTEGER;
ALTER TABLE "Rider" ADD COLUMN "driverLicenseNumber" TEXT;
ALTER TABLE "Rider" ADD COLUMN "driverLicenseExpiry" TIMESTAMP(3);
ALTER TABLE "Rider" ADD COLUMN "vehicleInsuranceExpiry" TIMESTAMP(3);
ALTER TABLE "Rider" ADD COLUMN "bankName" TEXT;
ALTER TABLE "Rider" ADD COLUMN "bankCode" TEXT;
ALTER TABLE "Rider" ADD COLUMN "accountNumber" TEXT;
ALTER TABLE "Rider" ADD COLUMN "accountName" TEXT;
ALTER TABLE "Rider" ADD COLUMN "bvn" TEXT;
ALTER TABLE "Rider" ADD COLUMN "nin" TEXT;
ALTER TABLE "Rider" ADD COLUMN "kycStatus" "RiderKycStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Rider" ADD COLUMN "kycNotes" TEXT;
ALTER TABLE "Rider" ADD COLUMN "emergencyContactName" TEXT;
ALTER TABLE "Rider" ADD COLUMN "emergencyContactPhone" TEXT;
ALTER TABLE "Rider" ADD COLUMN "emergencyContactRelationship" TEXT;
ALTER TABLE "Rider" ADD COLUMN "guarantors" JSONB;
ALTER TABLE "Rider" ADD COLUMN "documents" JSONB;

CREATE UNIQUE INDEX "Rider_email_key" ON "Rider"("email");

-- CreateTable AdminNotification
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminNotification_adminId_idx" ON "AdminNotification"("adminId");
CREATE INDEX "AdminNotification_adminId_isRead_idx" ON "AdminNotification"("adminId", "isRead");

ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
