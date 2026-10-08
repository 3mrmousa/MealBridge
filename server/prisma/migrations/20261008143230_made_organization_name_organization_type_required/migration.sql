/*
  Warnings:

  - Made the column `organization_name` on table `donor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organization_type` on table `donor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organization_name` on table `recipient_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organization_type` on table `recipient_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "donor_organization_type" ADD VALUE 'INDIVIDUAL';

-- AlterEnum
ALTER TYPE "recipient_organization_type" ADD VALUE 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "donor_profiles" ALTER COLUMN "organization_name" SET NOT NULL,
ALTER COLUMN "organization_type" SET NOT NULL;

-- AlterTable
ALTER TABLE "recipient_profiles" ALTER COLUMN "organization_name" SET NOT NULL,
ALTER COLUMN "organization_type" SET NOT NULL;
