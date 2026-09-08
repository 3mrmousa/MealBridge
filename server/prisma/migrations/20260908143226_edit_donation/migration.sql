/*
  Warnings:

  - The `images` column on the `donation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "donation" DROP COLUMN "images",
ADD COLUMN     "images" JSONB[];
