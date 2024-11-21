import { PrismaClient } from "@prisma/client";
import { INVESTORS } from "./mocks/investors.js";
import { STARTUPS } from "./mocks/startups.js";
import { CATEGORIES } from "./mocks/startups.js";

const prisma = new PrismaClient();

async function main() {
  // 테이블을 비우고 시퀀스를 초기화
  await prisma.mockInvestor.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.category.deleteMany();

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

  await Promise.all(
    INVESTORS.map(async (mockInvestor) => {
      await prisma.mockInvestor.create({data:mockInvestor});
    })
  );

  // 각 테이블의 시퀀스를 재설정
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), (SELECT MAX(id) FROM "Category"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Startup"', 'id'), (SELECT MAX(id) FROM "Startup"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"MockInvestor"', 'id'), (SELECT MAX(id) FROM "MockInvestor"))`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
