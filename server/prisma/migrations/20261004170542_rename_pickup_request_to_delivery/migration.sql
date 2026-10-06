/*
  Warnings:

  - You are about to drop the `pickup_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "pickup_request" DROP CONSTRAINT "pickup_request_donation_claim_id_fkey";

-- DropForeignKey
ALTER TABLE "pickup_request" DROP CONSTRAINT "pickup_request_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "pickup_request" DROP CONSTRAINT "pickup_request_volunteer_id_fkey";

-- DropTable
DROP TABLE "pickup_request";

-- DropEnum
DROP TYPE "pickup_request_status";

-- CreateTable
CREATE TABLE "delivery" (
    "id" UUID NOT NULL,
    "donation_claim_id" UUID NOT NULL,
    "volunteer_id" UUID,
    "pickup_address" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "notes" TEXT,
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "delivery_status" NOT NULL,
    "cancel_requested_by" "role",
    "cancel_requested_at" TIMESTAMP(3),
    "cancel_requested_reason" TEXT,
    "cancel_request_status" "cancel_request_status",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_donation_claim_id_key" ON "delivery"("donation_claim_id");

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_donation_claim_id_fkey" FOREIGN KEY ("donation_claim_id") REFERENCES "donation_claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
