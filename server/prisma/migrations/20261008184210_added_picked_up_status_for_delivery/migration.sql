-- AlterEnum
ALTER TYPE "delivery_status" ADD VALUE 'PICKED_UP';

-- AlterTable
ALTER TABLE "delivery" ALTER COLUMN "status" SET DEFAULT 'PENDING';
