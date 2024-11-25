/*
  Warnings:

  - You are about to drop the column `count` on the `Startup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Startup" DROP COLUMN "count",
ADD COLUMN     "selectCount" INTEGER NOT NULL DEFAULT 0;
