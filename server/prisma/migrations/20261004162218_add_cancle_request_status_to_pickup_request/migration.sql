-- CreateEnum
CREATE TYPE "cancel_request_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "pickup_request" ADD COLUMN     "cancel_request_status" "cancel_request_status";
