-- CreateEnum
CREATE TYPE "InvestorKycStepStatus" AS ENUM ('NOT_STARTED', 'IN_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvestorTxType" AS ENUM ('TOPUP', 'WITHDRAWAL', 'INVESTMENT', 'PAYOUT', 'SAFE_LOCK', 'SAFE_UNLOCK', 'SAFE_INTEREST', 'REFERRAL_BONUS');

-- CreateEnum
CREATE TYPE "InvestorWalletKind" AS ENUM ('MAIN', 'PAYOUT', 'SAFE');

-- CreateEnum
CREATE TYPE "InvestorTxStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvestmentVehicleClass" AS ENUM ('KEKE', 'SHUTTLE', 'RIDE_CAR', 'BIKE');

-- CreateEnum
CREATE TYPE "InvestmentAssetStatus" AS ENUM ('OPEN', 'FUNDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'MATURED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvestmentPayoutStatus" AS ENUM ('SCHEDULED', 'PAID');

-- CreateEnum
CREATE TYPE "FlowSafeVaultKind" AS ENUM ('FLEXIBLE', 'LOCKED');

-- CreateEnum
CREATE TYPE "FlowSafeVaultStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "referralCode" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "bvnStatus" "InvestorKycStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "idStatus" "InvestorKycStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "addressProofStatus" "InvestorKycStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorRefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorSettings" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "biometricLogin" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "payoutAlerts" BOOLEAN NOT NULL DEFAULT true,
    "investmentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT false,
    "emailStatements" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "language" TEXT NOT NULL DEFAULT 'English',
    "appLockTimeoutMin" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorWallet" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "mainBalanceKobo" INTEGER NOT NULL DEFAULT 0,
    "payoutBalanceKobo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorTransaction" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "type" "InvestorTxType" NOT NULL,
    "wallet" "InvestorWalletKind" NOT NULL DEFAULT 'MAIN',
    "amountKobo" INTEGER NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "status" "InvestorTxStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "vehicleClass" "InvestmentVehicleClass" NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "imageUrl" TEXT,
    "unitPriceKobo" INTEGER NOT NULL,
    "minInvestKobo" INTEGER NOT NULL,
    "projectedRoiBps" INTEGER NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "monthlyPayoutKobo" INTEGER NOT NULL,
    "targetKobo" INTEGER NOT NULL,
    "raisedKobo" INTEGER NOT NULL DEFAULT 0,
    "slotsTotal" INTEGER NOT NULL,
    "slotsLeft" INTEGER NOT NULL,
    "investorCount" INTEGER NOT NULL DEFAULT 0,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "status" "InvestmentAssetStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "monthlyRateBps" INTEGER NOT NULL,
    "minAmountKobo" INTEGER NOT NULL,
    "note" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "monthlyPayoutKobo" INTEGER NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "startedAt" TIMESTAMP(3),
    "maturesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentPayout" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "status" "InvestmentPayoutStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "InvestmentPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowSafeVault" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FlowSafeVaultKind" NOT NULL,
    "principalKobo" INTEGER NOT NULL,
    "interestRateBps" INTEGER NOT NULL,
    "interestEarnedKobo" INTEGER NOT NULL DEFAULT 0,
    "lockDays" INTEGER,
    "unlocksAt" TIMESTAMP(3),
    "status" "FlowSafeVaultStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowSafeVault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorBankAccount" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorNotification" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investor_username_key" ON "Investor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_email_key" ON "Investor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_phone_key" ON "Investor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_referralCode_key" ON "Investor"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorRefreshToken_token_key" ON "InvestorRefreshToken"("token");

-- CreateIndex
CREATE INDEX "InvestorRefreshToken_investorId_idx" ON "InvestorRefreshToken"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorSettings_investorId_key" ON "InvestorSettings"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorWallet_investorId_key" ON "InvestorWallet"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorTransaction_reference_key" ON "InvestorTransaction"("reference");

-- CreateIndex
CREATE INDEX "InvestorTransaction_investorId_idx" ON "InvestorTransaction"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_reference_key" ON "Investment"("reference");

-- CreateIndex
CREATE INDEX "Investment_investorId_idx" ON "Investment"("investorId");

-- CreateIndex
CREATE INDEX "Investment_assetId_idx" ON "Investment"("assetId");

-- CreateIndex
CREATE INDEX "InvestmentPayout_investmentId_idx" ON "InvestmentPayout"("investmentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentPayout_investmentId_sequence_key" ON "InvestmentPayout"("investmentId", "sequence");

-- CreateIndex
CREATE INDEX "FlowSafeVault_investorId_idx" ON "FlowSafeVault"("investorId");

-- CreateIndex
CREATE INDEX "InvestorBankAccount_investorId_idx" ON "InvestorBankAccount"("investorId");

-- CreateIndex
CREATE INDEX "InvestorNotification_investorId_idx" ON "InvestorNotification"("investorId");

-- AddForeignKey
ALTER TABLE "InvestorRefreshToken" ADD CONSTRAINT "InvestorRefreshToken_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorSettings" ADD CONSTRAINT "InvestorSettings_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorWallet" ADD CONSTRAINT "InvestorWallet_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorTransaction" ADD CONSTRAINT "InvestorTransaction_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "InvestmentAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InvestmentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentPayout" ADD CONSTRAINT "InvestmentPayout_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowSafeVault" ADD CONSTRAINT "FlowSafeVault_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorBankAccount" ADD CONSTRAINT "InvestorBankAccount_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorNotification" ADD CONSTRAINT "InvestorNotification_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

