-- Add BUSINESS to AdminType enum
ALTER TYPE "AdminType" ADD VALUE IF NOT EXISTS 'BUSINESS';

-- BusinessStatus enum
DO $$ BEGIN
  CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- BusinessWalletTxType enum
DO $$ BEGIN
  CREATE TYPE "BusinessWalletTxType" AS ENUM ('RIDER_EARNING', 'WITHDRAWAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Business table
CREATE TABLE IF NOT EXISTS "Business" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "email"     TEXT,
    "phone"     TEXT,
    "address"   TEXT,
    "status"    "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Business_email_key" ON "Business"("email");

-- BusinessWallet table
CREATE TABLE IF NOT EXISTS "BusinessWallet" (
    "id"          TEXT NOT NULL,
    "businessId"  TEXT NOT NULL,
    "balanceKobo" INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessWallet_businessId_key" ON "BusinessWallet"("businessId");
ALTER TABLE "BusinessWallet" ADD CONSTRAINT "BusinessWallet_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BusinessWalletTransaction table
CREATE TABLE IF NOT EXISTS "BusinessWalletTransaction" (
    "id"          TEXT NOT NULL,
    "walletId"    TEXT NOT NULL,
    "riderId"     TEXT,
    "type"        "BusinessWalletTxType" NOT NULL,
    "amountKobo"  INTEGER NOT NULL,
    "reference"   TEXT,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessWalletTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessWalletTransaction_reference_key" ON "BusinessWalletTransaction"("reference");
CREATE INDEX IF NOT EXISTS "BusinessWalletTransaction_walletId_idx" ON "BusinessWalletTransaction"("walletId");
ALTER TABLE "BusinessWalletTransaction" ADD CONSTRAINT "BusinessWalletTransaction_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "BusinessWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add businessId to Admin
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
CREATE INDEX IF NOT EXISTS "Admin_businessId_idx" ON "Admin"("businessId");
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add businessId to Rider
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
CREATE INDEX IF NOT EXISTS "Rider_businessId_idx" ON "Rider"("businessId");
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
