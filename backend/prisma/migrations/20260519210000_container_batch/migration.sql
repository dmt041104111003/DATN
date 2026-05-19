CREATE TABLE IF NOT EXISTS "ContainerBatch" (
  "id" TEXT NOT NULL,
  "registeringCustodianAddress" TEXT NOT NULL,
  "totalBoxes" INTEGER NOT NULL,
  "completedBoxes" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContainerBatch_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Container" ADD COLUMN IF NOT EXISTS "batchId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Container_batchId_fkey'
  ) THEN
    ALTER TABLE "Container"
      ADD CONSTRAINT "Container_batchId_fkey"
      FOREIGN KEY ("batchId") REFERENCES "ContainerBatch"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Container_batchId_idx" ON "Container"("batchId");
