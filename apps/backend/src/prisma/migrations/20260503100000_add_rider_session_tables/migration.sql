-- CreateEnum
CREATE TYPE "RiderEarningStatus" AS ENUM ('PENDING', 'SETTLED');

-- CreateEnum
CREATE TYPE "RiderWithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "RiderRefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiderRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderPushToken" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RiderPushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderNotification" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiderNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderEarning" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "status" "RiderEarningStatus" NOT NULL DEFAULT 'PENDING',
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiderEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderWithdrawal" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "reference" TEXT,
    "status" "RiderWithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RiderWithdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiderRefreshToken_token_key" ON "RiderRefreshToken"("token");
CREATE INDEX "RiderRefreshToken_riderId_idx" ON "RiderRefreshToken"("riderId");

-- CreateIndex
CREATE UNIQUE INDEX "RiderPushToken_riderId_token_key" ON "RiderPushToken"("riderId", "token");

-- CreateIndex
CREATE INDEX "RiderNotification_riderId_idx" ON "RiderNotification"("riderId");
CREATE INDEX "RiderNotification_riderId_isRead_idx" ON "RiderNotification"("riderId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "RiderEarning_orderId_key" ON "RiderEarning"("orderId");
CREATE INDEX "RiderEarning_riderId_idx" ON "RiderEarning"("riderId");

-- CreateIndex
CREATE UNIQUE INDEX "RiderWithdrawal_reference_key" ON "RiderWithdrawal"("reference");
CREATE INDEX "RiderWithdrawal_riderId_idx" ON "RiderWithdrawal"("riderId");

-- AddForeignKey
ALTER TABLE "RiderRefreshToken" ADD CONSTRAINT "RiderRefreshToken_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderPushToken" ADD CONSTRAINT "RiderPushToken_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderNotification" ADD CONSTRAINT "RiderNotification_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderEarning" ADD CONSTRAINT "RiderEarning_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderEarning" ADD CONSTRAINT "RiderEarning_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderWithdrawal" ADD CONSTRAINT "RiderWithdrawal_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
