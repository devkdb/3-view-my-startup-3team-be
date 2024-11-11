/*
  Warnings:

  - Made the column `startupId` on table `MockInvestor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MockInvestor" DROP CONSTRAINT "MockInvestor_startupId_fkey";

-- AlterTable
ALTER TABLE "MockInvestor" ALTER COLUMN "startupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MockInvestor" ADD CONSTRAINT "MockInvestor_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
