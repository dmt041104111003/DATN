-- AlterTable
ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "actualCapacityKg" TEXT;
ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "capacityKg" TEXT;
ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "participantLocationLabels" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "participantWalletAddresses" TEXT NOT NULL DEFAULT '[]';
