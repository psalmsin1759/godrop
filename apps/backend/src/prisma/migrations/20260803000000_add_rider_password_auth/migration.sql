-- Add password auth fields to Rider
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "passwordResetExpiry" TIMESTAMP(3);

-- Unique constraint on passwordResetToken
CREATE UNIQUE INDEX IF NOT EXISTS "Rider_passwordResetToken_key" ON "Rider"("passwordResetToken");
