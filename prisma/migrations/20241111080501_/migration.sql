/*
  Warnings:

  - You are about to drop the `Mockinvestor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mockinvestor" DROP CONSTRAINT "Mockinvestor_startupId_fkey";

-- DropTable
DROP TABLE "Mockinvestor";

-- CreateTable
CREATE TABLE "MockInvestor" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "InvestAmount" BIGINT NOT NULL DEFAULT 0,
    "comment" TEXT NOT NULL,
    "password" VARCHAR(40) NOT NULL,
    "startupId" INTEGER NOT NULL,

    CONSTRAINT "MockInvestor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MockInvestor" ADD CONSTRAINT "MockInvestor_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
