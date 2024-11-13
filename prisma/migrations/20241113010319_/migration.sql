-- DropForeignKey
ALTER TABLE "Comparison" DROP CONSTRAINT "Comparison_startupId_fkey";

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
