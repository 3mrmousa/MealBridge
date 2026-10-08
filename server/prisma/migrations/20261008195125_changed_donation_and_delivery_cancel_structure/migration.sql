/*
  Warnings:

  - You are about to drop the column `cancel_request_status` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the column `cancel_requested_at` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the column `cancel_requested_by` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the column `cancel_requested_reason` on the `delivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "delivery" DROP COLUMN "cancel_request_status",
DROP COLUMN "cancel_requested_at",
DROP COLUMN "cancel_requested_by",
DROP COLUMN "cancel_requested_reason",
ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "canceled_by" "role",
ADD COLUMN     "canceled_reason" TEXT;

-- DropEnum
DROP TYPE "cancel_request_status";
