-- Add registration fields
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "cacRegistrationNumber" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "tin"                   TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "yearEstablished"       INTEGER;

-- Add owner fields
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerFullName"    TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerPhoneNumber" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerEmail"       TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerNIN"         TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerBVN"         TEXT;

-- Add operations
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "serviceAreas" TEXT[] NOT NULL DEFAULT '{}';

-- Add document URLs
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "cacCertificateUrl"    TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "driversLicenseUrl"    TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "insuranceDocumentUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "utilityBillUrl"       TEXT;

-- Add banking
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "bankName"      TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "accountName"   TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
