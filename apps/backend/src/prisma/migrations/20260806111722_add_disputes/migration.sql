-- CreateEnum
CREATE TYPE "DisputeRaisedByType" AS ENUM ('CUSTOMER', 'VENDOR', 'RIDER');

-- CreateEnum
CREATE TYPE "DisputeCategory" AS ENUM ('WRONG_ITEM', 'MISSING_ITEMS', 'DAMAGED_ITEM', 'FOOD_QUALITY', 'LATE_DELIVERY', 'NEVER_ARRIVED', 'RIDER_BEHAVIOR', 'VENDOR_BEHAVIOR', 'CUSTOMER_BEHAVIOR', 'PAYMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'ESCALATED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeResolutionType" AS ENUM ('REFUND_CUSTOMER', 'COMPENSATE_RIDER', 'NO_ACTION', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeSenderType" AS ENUM ('CUSTOMER', 'VENDOR', 'RIDER', 'ADMIN');

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "raisedByType" "DisputeRaisedByType" NOT NULL,
    "raisedByCustomerId" TEXT,
    "raisedByVendorId" TEXT,
    "raisedByRiderId" TEXT,
    "category" "DisputeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT[],
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" TEXT,
    "resolutionType" "DisputeResolutionType",
    "resolutionNotes" TEXT,
    "resolutionAmountKobo" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeMessage" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "senderType" "DisputeSenderType" NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dispute_orderId_idx" ON "Dispute"("orderId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_raisedByCustomerId_idx" ON "Dispute"("raisedByCustomerId");

-- CreateIndex
CREATE INDEX "Dispute_raisedByVendorId_idx" ON "Dispute"("raisedByVendorId");

-- CreateIndex
CREATE INDEX "Dispute_raisedByRiderId_idx" ON "Dispute"("raisedByRiderId");

-- CreateIndex
CREATE INDEX "Dispute_assignedAdminId_idx" ON "Dispute"("assignedAdminId");

-- CreateIndex
CREATE INDEX "DisputeMessage_disputeId_idx" ON "DisputeMessage"("disputeId");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedByCustomerId_fkey" FOREIGN KEY ("raisedByCustomerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedByVendorId_fkey" FOREIGN KEY ("raisedByVendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedByRiderId_fkey" FOREIGN KEY ("raisedByRiderId") REFERENCES "Rider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeMessage" ADD CONSTRAINT "DisputeMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

