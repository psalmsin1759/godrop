-- Add password auth fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpiry" TIMESTAMP(3);

-- Unique constraint on passwordResetToken
CREATE UNIQUE INDEX IF NOT EXISTS "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- SavedCard table (Paystack tokenisation)
CREATE TABLE IF NOT EXISTS "SavedCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorizationCode" TEXT NOT NULL,
    "cardType" TEXT,
    "last4" TEXT,
    "expMonth" TEXT,
    "expYear" TEXT,
    "bank" TEXT,
    "email" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCard_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SavedCard_userId_idx" ON "SavedCard"("userId");
ALTER TABLE "SavedCard" ADD CONSTRAINT "SavedCard_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- VendorWallet table
CREATE TABLE IF NOT EXISTS "VendorWallet" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "balanceKobo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorWallet_vendorId_key" ON "VendorWallet"("vendorId");
ALTER TABLE "VendorWallet" ADD CONSTRAINT "VendorWallet_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- VendorWalletTxType enum
DO $$ BEGIN
    CREATE TYPE "VendorWalletTxType" AS ENUM ('CREDIT', 'WITHDRAWAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VendorWalletTransaction table
CREATE TABLE IF NOT EXISTS "VendorWalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "VendorWalletTxType" NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorWalletTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorWalletTransaction_reference_key" ON "VendorWalletTransaction"("reference");
CREATE INDEX IF NOT EXISTS "VendorWalletTransaction_walletId_idx" ON "VendorWalletTransaction"("walletId");
ALTER TABLE "VendorWalletTransaction" ADD CONSTRAINT "VendorWalletTransaction_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "VendorWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- VendorBankAccount table
CREATE TABLE IF NOT EXISTS "VendorBankAccount" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorBankAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorBankAccount_vendorId_key" ON "VendorBankAccount"("vendorId");
ALTER TABLE "VendorBankAccount" ADD CONSTRAINT "VendorBankAccount_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- VendorWithdrawalStatus enum
DO $$ BEGIN
    CREATE TYPE "VendorWithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VendorWithdrawal table
CREATE TABLE IF NOT EXISTS "VendorWithdrawal" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "reference" TEXT,
    "status" "VendorWithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorWithdrawal_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorWithdrawal_reference_key" ON "VendorWithdrawal"("reference");
CREATE INDEX IF NOT EXISTS "VendorWithdrawal_vendorId_idx" ON "VendorWithdrawal"("vendorId");

-- PlatformSettings: add new columns
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "vendorPlatformFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "paystackPublicKey" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "paystackSecretKey" TEXT;

-- Order: add idempotencyKey
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
