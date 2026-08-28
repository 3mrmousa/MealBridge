/*
  Warnings:

  - The `profile_picture` column on the `donor_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profile_picture` column on the `recipient_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profile_picture` column on the `volunteer_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "donor_profiles" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" JSONB;

-- AlterTable
ALTER TABLE "recipient_profiles" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" JSONB;

-- AlterTable
ALTER TABLE "volunteer_profiles" DROP COLUMN "profile_picture",
ADD COLUMN     "profile_picture" JSONB;
