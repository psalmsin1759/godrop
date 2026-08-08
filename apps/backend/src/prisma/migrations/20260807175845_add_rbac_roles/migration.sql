-- Granular RBAC: Role table + Admin.roleId/isOwner, drop the flat AdminRole enum.

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AdminType" NOT NULL,
    "vendorId" TEXT,
    "businessId" TEXT,
    "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_type_vendorId_businessId_key" ON "Role"("name", "type", "vendorId", "businessId");
CREATE INDEX "Role_vendorId_idx" ON "Role"("vendorId");
CREATE INDEX "Role_businessId_idx" ON "Role"("businessId");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Role" ADD CONSTRAINT "Role_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default role templates (global — vendorId/businessId null)
INSERT INTO "Role" (id, name, type, permissions, "isDefault", description, "updatedAt") VALUES
  (md5(random()::text || clock_timestamp()::text), 'Super Admin', 'SYSTEM', ARRAY['*'], true, 'Full platform access', now()),
  (md5(random()::text || clock_timestamp()::text), 'Operations Admin', 'SYSTEM', ARRAY['orders:read','orders:write','riders:read','riders:write','riders:payouts','trucks:read','trucks:write','parcels:read','parcels:write','vendors:read'], true, 'Day-to-day logistics: orders, riders, trucks, parcels', now()),
  (md5(random()::text || clock_timestamp()::text), 'Support Admin', 'SYSTEM', ARRAY['customers:read','customers:write','disputes:read','disputes:write','otp:issue','orders:read'], true, 'Customer support and dispute resolution', now()),
  (md5(random()::text || clock_timestamp()::text), 'Finance Admin', 'SYSTEM', ARRAY['vendors:read','riders:payouts','analytics:read','audit_logs:read'], true, 'Payouts and financial oversight', now()),
  (md5(random()::text || clock_timestamp()::text), 'Marketing Admin', 'SYSTEM', ARRAY['heroes:write','banners:write','coupons:write','messaging:send','push:send'], true, 'Growth and marketing tools', now()),
  (md5(random()::text || clock_timestamp()::text), 'Analytics Admin', 'SYSTEM', ARRAY['analytics:read','audit_logs:read'], true, 'Read-only analytics and audit oversight', now()),
  (md5(random()::text || clock_timestamp()::text), 'Owner', 'VENDOR', ARRAY['*'], true, 'Full vendor account access', now()),
  (md5(random()::text || clock_timestamp()::text), 'Manager', 'VENDOR', ARRAY['orders:read','orders:write','catalog:read','catalog:write','wallet:read','disputes:read','disputes:write','analytics:read','audit_logs:read','team:read'], true, 'Runs day-to-day operations, no settings/team changes', now()),
  (md5(random()::text || clock_timestamp()::text), 'Staff', 'VENDOR', ARRAY['orders:read','orders:write','catalog:read','catalog:write','disputes:read','disputes:write'], true, 'Order and catalogue handling only', now()),
  (md5(random()::text || clock_timestamp()::text), 'Owner', 'BUSINESS', ARRAY['*'], true, 'Full business account access', now()),
  (md5(random()::text || clock_timestamp()::text), 'Manager', 'BUSINESS', ARRAY['riders:read','riders:write','wallet:read','team:read','business:write'], true, 'Manages riders and business profile', now()),
  (md5(random()::text || clock_timestamp()::text), 'Staff', 'BUSINESS', ARRAY['riders:read','team:read'], true, 'Read-only rider/team visibility', now());

-- AlterTable: add roleId (nullable for now) + isOwner
ALTER TABLE "Admin" ADD COLUMN "roleId" TEXT;
ALTER TABLE "Admin" ADD COLUMN "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- Backfill roleId from the old flat "role" enum column
UPDATE "Admin" a SET "roleId" = r.id
FROM "Role" r
WHERE r."isDefault" = true AND r."vendorId" IS NULL AND r."businessId" IS NULL AND (
  (a."type" = 'SYSTEM'   AND a."role" = 'SUPER_ADMIN' AND r."type" = 'SYSTEM'   AND r."name" = 'Super Admin') OR
  (a."type" = 'SYSTEM'   AND a."role" = 'ADMIN'        AND r."type" = 'SYSTEM'   AND r."name" = 'Operations Admin') OR
  (a."type" = 'VENDOR'   AND a."role" = 'OWNER'         AND r."type" = 'VENDOR'   AND r."name" = 'Owner') OR
  (a."type" = 'VENDOR'   AND a."role" = 'MANAGER'        AND r."type" = 'VENDOR'   AND r."name" = 'Manager') OR
  (a."type" = 'VENDOR'   AND a."role" = 'STAFF'           AND r."type" = 'VENDOR'   AND r."name" = 'Staff') OR
  (a."type" = 'BUSINESS' AND a."role" = 'OWNER'         AND r."type" = 'BUSINESS' AND r."name" = 'Owner') OR
  (a."type" = 'BUSINESS' AND a."role" = 'ADMIN'          AND r."type" = 'BUSINESS' AND r."name" = 'Manager')
);

-- Anything unmapped (shouldn't happen) falls back to a sane default per type
UPDATE "Admin" a SET "roleId" = r.id FROM "Role" r
WHERE a."roleId" IS NULL AND r."isDefault" = true AND r."vendorId" IS NULL AND r."businessId" IS NULL
  AND r."type" = a."type" AND r."name" = CASE a."type" WHEN 'SYSTEM' THEN 'Operations Admin' ELSE 'Staff' END;

-- Preserve the old OWNER special-casing as an identity flag, independent of the role bundle
UPDATE "Admin" SET "isOwner" = true WHERE "role" = 'OWNER';

-- Enforce NOT NULL + FK now that every row is backfilled
ALTER TABLE "Admin" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Admin_roleId_idx" ON "Admin"("roleId");

-- Drop the old flat role column + enum
ALTER TABLE "Admin" DROP COLUMN "role";
DROP TYPE "AdminRole";
