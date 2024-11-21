import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** 
 * 파라미터로 startups, offset, limit 받아서 페이지네이션에 필요한 데이터를 추출하여 responseData 반환
*/
const paginationHandler = async (
  startups, offsetNum, limitNum) => {
  
  const totalStartups = await prisma.startup.count();
  const currentPage = Math.floor(offsetNum / limitNum) + 1;
  const totalPages = Math.ceil(totalStartups / limitNum);
  const hasNextPage = offsetNum + limitNum < totalStartups;
  const responseData = { totalStartups, currentPage, startups, totalPages, hasNextPage };
  return responseData;
}

export default paginationHandler;