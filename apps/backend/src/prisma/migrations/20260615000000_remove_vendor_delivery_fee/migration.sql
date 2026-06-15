-- Vendors no longer set their own delivery fee; the platform-wide
-- standard delivery fee (PlatformSettings.standardDeliveryFeeKobo) is used instead.
ALTER TABLE "Vendor" DROP COLUMN "deliveryFeeKobo";
