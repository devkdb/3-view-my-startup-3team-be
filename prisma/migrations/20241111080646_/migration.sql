/*
  Warnings:

  - You are about to drop the column `CategoryId` on the `Startup` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Startup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Startup" DROP CONSTRAINT "Startup_CategoryId_fkey";

-- AlterTable
ALTER TABLE "Startup" DROP COLUMN "CategoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
