/*
  Warnings:

  - Made the column `startupId` on table `MockInvestor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `Startup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MockInvestor" DROP CONSTRAINT "MockInvestor_startupId_fkey";

-- DropForeignKey
ALTER TABLE "Startup" DROP CONSTRAINT "Startup_categoryId_fkey";

-- AlterTable
ALTER TABLE "MockInvestor" ALTER COLUMN "startupId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Startup" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInvestor" ADD CONSTRAINT "MockInvestor_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
