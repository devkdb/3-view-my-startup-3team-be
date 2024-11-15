/*
  Warnings:

  - Made the column `icCompare` on table `Comparison` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comparison" ALTER COLUMN "icCompare" SET NOT NULL;
