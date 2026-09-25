/*
  Warnings:

  - A unique constraint covering the columns `[recipient_id,donation_id]` on the table `donation_request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "donation_request_recipient_id_donation_id_key" ON "donation_request"("recipient_id", "donation_id");
