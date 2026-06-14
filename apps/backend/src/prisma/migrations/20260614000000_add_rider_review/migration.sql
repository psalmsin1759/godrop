-- AlterTable
ALTER TABLE "Review" ADD COLUMN "riderId" TEXT;

-- CreateIndex
CREATE INDEX "Review_riderId_idx" ON "Review"("riderId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
