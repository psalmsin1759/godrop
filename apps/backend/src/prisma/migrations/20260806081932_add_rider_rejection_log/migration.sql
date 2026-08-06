-- CreateTable
CREATE TABLE "RiderRejection" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderRejection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiderRejection_riderId_idx" ON "RiderRejection"("riderId");

-- CreateIndex
CREATE INDEX "RiderRejection_orderId_idx" ON "RiderRejection"("orderId");

-- AddForeignKey
ALTER TABLE "RiderRejection" ADD CONSTRAINT "RiderRejection_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderRejection" ADD CONSTRAINT "RiderRejection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

