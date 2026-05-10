-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "receiveRiderEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiveVendorEmails" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "documents" JSONB;
