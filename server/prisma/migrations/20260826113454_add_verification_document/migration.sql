-- AlterTable
ALTER TABLE "donor_profiles" ADD COLUMN     "verification_document" TEXT;

-- AlterTable
ALTER TABLE "recipient_profiles" ADD COLUMN     "verification_document" TEXT;

-- AlterTable
ALTER TABLE "volunteer_profiles" ADD COLUMN     "verification_document" TEXT;
