/*
  Warnings:

  - The values [ACCEPTED,REJECTED] on the enum `delivery_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `accepted_at` on the `delivery` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "delivery_status_new" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');
ALTER TABLE "delivery" ALTER COLUMN "status" TYPE "delivery_status_new" USING ("status"::text::"delivery_status_new");
ALTER TYPE "delivery_status" RENAME TO "delivery_status_old";
ALTER TYPE "delivery_status_new" RENAME TO "delivery_status";
DROP TYPE "public"."delivery_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "delivery" DROP COLUMN "accepted_at";
