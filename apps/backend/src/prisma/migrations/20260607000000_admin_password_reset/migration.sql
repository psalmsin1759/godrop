-- AddColumn Admin.passwordResetToken and Admin.passwordResetExpiry
ALTER TABLE "Admin" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "Admin" ADD COLUMN "passwordResetExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_passwordResetToken_key" ON "Admin"("passwordResetToken");
