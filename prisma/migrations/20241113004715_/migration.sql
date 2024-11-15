-- AlterTable
ALTER TABLE "Comparison" ALTER COLUMN "icCompare" DROP NOT NULL,
ALTER COLUMN "icCompare" SET DEFAULT false;
