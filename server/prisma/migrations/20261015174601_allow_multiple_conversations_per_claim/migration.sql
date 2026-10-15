/*
  Warnings:

  - A unique constraint covering the columns `[donation_claim_id,conversation_type]` on the table `conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "conversation_donation_claim_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "conversation_donation_claim_id_conversation_type_key" ON "conversation"("donation_claim_id", "conversation_type");
