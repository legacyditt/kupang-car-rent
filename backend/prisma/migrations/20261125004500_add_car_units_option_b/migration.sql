-- CreateTable
CREATE TABLE "CarUnit" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "transmission" "TransmissionPreference" NOT NULL DEFAULT 'MANUAL',
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarUnit_plateNumber_key" ON "CarUnit"("plateNumber");

-- CreateIndex
CREATE INDEX "CarUnit_carId_status_transmission_idx" ON "CarUnit"("carId", "status", "transmission");

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "carUnitId" TEXT,
ADD COLUMN "carUnitLabelSnapshot" TEXT;

-- CreateIndex
CREATE INDEX "Booking_carUnitId_status_startDate_endDate_idx" ON "Booking"("carUnitId", "status", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "CarUnit" ADD CONSTRAINT "CarUnit_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_carUnitId_fkey" FOREIGN KEY ("carUnitId") REFERENCES "CarUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill 1 default CarUnit per existing Car so existing data stays valid
INSERT INTO "CarUnit" ("id", "carId", "label", "plateNumber", "transmission", "status", "updatedAt")
SELECT
  'unit-' || "id",
  "id",
  "name" || ' #1',
  'DH-' || UPPER(SUBSTRING(MD5("id"), 1, 6)),
  CASE WHEN "transmission" = 'MATIC' THEN 'MATIC'::"TransmissionPreference" ELSE 'MANUAL'::"TransmissionPreference" END,
  "status",
  NOW()
FROM "Car"
ON CONFLICT ("id") DO NOTHING;

-- Backfill carUnitId for existing CONFIRMED / IN_PROGRESS bookings
UPDATE "Booking" b
SET "carUnitId" = 'unit-' || b."carId"
WHERE b."status" IN ('CONFIRMED', 'IN_PROGRESS') AND b."carUnitId" IS NULL;

-- Replace per-car exclusion constraint with per-physical-unit exclusion constraint (BR-09)
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS booking_no_overlap_confirmed_or_active;

ALTER TABLE "Booking"
  ADD CONSTRAINT booking_unit_no_overlap_confirmed_or_active
  EXCLUDE USING gist (
    "carUnitId" WITH =,
    daterange("startDate", "endDate", '[]') WITH &&
  )
  WHERE ("status" IN ('CONFIRMED', 'IN_PROGRESS') AND "carUnitId" IS NOT NULL);

