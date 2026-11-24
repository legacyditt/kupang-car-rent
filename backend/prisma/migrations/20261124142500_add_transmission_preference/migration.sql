-- CreateEnum
CREATE TYPE "TransmissionPreference" AS ENUM ('MATIC', 'MANUAL');

-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "brand" SET DEFAULT '-';
UPDATE "Car" SET "transmission" = 'BOTH' WHERE "transmission" IS NULL OR "transmission" NOT IN ('MATIC', 'MANUAL', 'BOTH');
ALTER TABLE "Car" ALTER COLUMN "transmission" SET NOT NULL,
ALTER COLUMN "transmission" SET DEFAULT 'BOTH';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "transmissionPreference" "TransmissionPreference" NOT NULL DEFAULT 'MANUAL';

