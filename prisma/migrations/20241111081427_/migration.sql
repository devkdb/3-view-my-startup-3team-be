/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Startup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Startup_name_key" ON "Startup"("name");
