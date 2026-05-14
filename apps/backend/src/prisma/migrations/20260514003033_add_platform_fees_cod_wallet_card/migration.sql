-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'WALLET_CARD';

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "costPerKmKobo" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN     "serviceChargeKobo" INTEGER NOT NULL DEFAULT 25000,
ADD COLUMN     "standardDeliveryFeeKobo" INTEGER NOT NULL DEFAULT 75000;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "cashOnDeliveryEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VendorBankAccount" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VendorWallet" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VendorWithdrawal" ALTER COLUMN "updatedAt" DROP DEFAULT;
