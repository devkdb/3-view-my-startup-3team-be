-- DropForeignKey
ALTER TABLE "Startup" DROP CONSTRAINT "Startup_categoryId_fkey";

-- AlterTable
ALTER TABLE "Startup" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
