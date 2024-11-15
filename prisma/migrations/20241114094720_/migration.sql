-- CreateTable
CREATE TABLE "Comparison" (
    "id" SERIAL NOT NULL,
    "compare" BOOLEAN NOT NULL DEFAULT false,
    "startupId" INTEGER NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
