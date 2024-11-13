/*
  Warnings:

  - You are about to drop the column `icCompare` on the `Comparison` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comparison" DROP COLUMN "icCompare",
ADD COLUMN     "compare" BOOLEAN NOT NULL DEFAULT false;
