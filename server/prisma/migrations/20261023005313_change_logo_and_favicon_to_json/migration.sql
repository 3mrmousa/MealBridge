/*
  Warnings:

  - You are about to drop the column `favicon_url` on the `site_setting` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `site_setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_setting" DROP COLUMN "favicon_url",
DROP COLUMN "logo_url",
ADD COLUMN     "favicon" JSONB,
ADD COLUMN     "logo" JSONB;
