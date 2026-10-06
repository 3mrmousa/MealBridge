/*
  Warnings:

  - You are about to drop the column `delivery_address` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the column `pickup_address` on the `delivery` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `donation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[donation_claim_id,volunteer_id]` on the table `delivery_request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipient_id` to the `delivery` table without a default value. This is not possible if the table is not empty.
  - Made the column `volunteer_id` on table `delivery` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `pickup_address` to the `donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_address` to the `donation_request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "delivery" DROP CONSTRAINT "delivery_volunteer_id_fkey";

-- AlterTable
ALTER TABLE "delivery" DROP COLUMN "delivery_address",
DROP COLUMN "pickup_address",
ADD COLUMN     "recipient_id" UUID NOT NULL,
ALTER COLUMN "volunteer_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "donation" DROP COLUMN "address",
ADD COLUMN     "pickup_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "donation_request" ADD COLUMN     "delivery_address" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "delivery_request_donation_claim_id_volunteer_id_key" ON "delivery_request"("donation_claim_id", "volunteer_id");

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
