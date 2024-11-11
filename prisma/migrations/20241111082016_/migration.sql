/*
  Warnings:

  - You are about to drop the column `InvestAmount` on the `MockInvestor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MockInvestor" DROP COLUMN "InvestAmount",
ADD COLUMN     "investAmount" BIGINT NOT NULL DEFAULT 0;
