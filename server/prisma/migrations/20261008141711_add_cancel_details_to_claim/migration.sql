/*
  Warnings:

  - Made the column `message` on table `donation_request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "donation_claim" ADD COLUMN     "canceled_by" "role",
ADD COLUMN     "canceled_reason" TEXT;

-- AlterTable
ALTER TABLE "donation_request" ALTER COLUMN "message" SET NOT NULL;
