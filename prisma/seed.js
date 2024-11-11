import { PrismaClient } from "@prisma/client";
import { CATEGORIES, STARTUPS, MOCK_INVESTORS, SELECTIONS, COMPARISONS } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 테이블을 비우고 시퀀스를 초기화
  await prisma.$executeRaw`TRUNCATE TABLE "Selection" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Comparison" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "MockInvestor" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Startup" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;

  // 카테고리 데이터 삽입
  await prisma.category.createMany({
    data: CATEGORIES,
    skipDuplicates: true,
  });

  // 스타트업 데이터 삽입
  await prisma.startup.createMany({
    data: STARTUPS,
    skipDuplicates: true,
  });

  // 투자자 데이터 삽입
  await prisma.mockInvestor.createMany({
    data: MOCK_INVESTORS,
    skipDuplicates: true,
  });

  // Selection 데이터 삽입
  await prisma.selection.createMany({
    data: SELECTIONS,
    skipDuplicates: true,
  });

  // Comparison 데이터 삽입
  await prisma.comparison.createMany({
    data: COMPARISONS,
    skipDuplicates: true,
  });

  // 각 테이블의 시퀀스를 재설정
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), (SELECT MAX(id) FROM "Category"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Startup"', 'id'), (SELECT MAX(id) FROM "Startup"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"MockInvestor"', 'id'), (SELECT MAX(id) FROM "MockInvestor"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Selection"', 'id'), (SELECT MAX(id) FROM "Selection"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Comparison"', 'id'), (SELECT MAX(id) FROM "Comparison"))`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
