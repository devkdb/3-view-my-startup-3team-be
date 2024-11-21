/*
  Warnings:

  - You are about to drop the `Comparison` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comparison" DROP CONSTRAINT "Comparison_startupId_fkey";

-- DropTable
DROP TABLE "Comparison";
