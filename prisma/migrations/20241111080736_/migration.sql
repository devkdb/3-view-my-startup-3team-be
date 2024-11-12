/*
  Warnings:

  - You are about to drop the column `siminvest` on the `Startup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Startup" DROP COLUMN "siminvest",
ADD COLUMN     "simInvest" BIGINT NOT NULL DEFAULT 0;
