-- CreateEnum
CREATE TYPE "OtpIssuedVia" AS ENUM ('SMS', 'ADMIN');

-- AlterTable
ALTER TABLE "Otp" ADD COLUMN "issuedVia" "OtpIssuedVia" NOT NULL DEFAULT 'SMS';

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "customerServicePhone" TEXT;
