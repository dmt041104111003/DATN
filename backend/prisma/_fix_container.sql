ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "weightPerBoxKg" TEXT;

UPDATE "Container"
SET "weightPerBoxKg" = COALESCE(NULLIF("actualCapacityKg", ''), NULLIF("capacityKg", ''))
WHERE "weightPerBoxKg" IS NULL;

ALTER TABLE "Container" DROP COLUMN IF EXISTS "capacityKg";
ALTER TABLE "Container" DROP COLUMN IF EXISTS "actualCapacityKg";
