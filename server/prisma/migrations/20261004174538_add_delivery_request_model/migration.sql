-- CreateEnum
CREATE TYPE "delivery_request_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "delivery_request" (
    "id" UUID NOT NULL,
    "donation_claim_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "status" "delivery_request_status" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "delivery_request" ADD CONSTRAINT "delivery_request_donation_claim_id_fkey" FOREIGN KEY ("donation_claim_id") REFERENCES "donation_claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_request" ADD CONSTRAINT "delivery_request_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_request" ADD CONSTRAINT "delivery_request_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
