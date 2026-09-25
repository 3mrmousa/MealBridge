/*
  Warnings:

  - The values [RESERVED] on the enum `donation_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "donation_status_new" AS ENUM ('AVAILABLE', 'COMPLETED', 'CANCELLED', 'EXPIRED');
ALTER TABLE "donation" ALTER COLUMN "status" TYPE "donation_status_new" USING ("status"::text::"donation_status_new");
ALTER TYPE "donation_status" RENAME TO "donation_status_old";
ALTER TYPE "donation_status_new" RENAME TO "donation_status";
DROP TYPE "public"."donation_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "donation_claim" ADD COLUMN     "collected_at" TIMESTAMP(3);
