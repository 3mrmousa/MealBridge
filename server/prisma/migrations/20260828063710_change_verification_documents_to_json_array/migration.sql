/*
  Warnings:

  - You are about to drop the column `verification_document` on the `donor_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `verification_document` on the `recipient_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `verification_document` on the `volunteer_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "donor_profiles" DROP COLUMN "verification_document",
ADD COLUMN     "verification_documents" JSONB;

-- AlterTable
ALTER TABLE "recipient_profiles" DROP COLUMN "verification_document",
ADD COLUMN     "verification_documents" JSONB;

-- AlterTable
ALTER TABLE "volunteer_profiles" DROP COLUMN "verification_document",
ADD COLUMN     "verification_documents" JSONB;
