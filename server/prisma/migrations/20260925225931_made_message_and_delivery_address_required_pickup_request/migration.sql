/*
  Warnings:

  - Made the column `delivery_address` on table `pickup_request` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message` on table `pickup_request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pickup_request" ALTER COLUMN "delivery_address" SET NOT NULL,
ALTER COLUMN "message" SET NOT NULL;
