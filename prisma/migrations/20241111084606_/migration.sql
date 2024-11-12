/*
  Warnings:

  - Made the column `name` on table `Startup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MockInvestor" DROP CONSTRAINT "MockInvestor_startupId_fkey";

-- AlterTable
ALTER TABLE "MockInvestor" ALTER COLUMN "startupId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Startup" ALTER COLUMN "name" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MockInvestor" ADD CONSTRAINT "MockInvestor_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
