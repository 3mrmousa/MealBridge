-- AlterTable
ALTER TABLE "pickup_request" ADD COLUMN     "cancel_requested_at" TIMESTAMP(3),
ADD COLUMN     "cancel_requested_by" "role",
ADD COLUMN     "cancel_requested_reason" TEXT;
