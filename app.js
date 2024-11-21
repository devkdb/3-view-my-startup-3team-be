import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import orderByStartup from './orderByFunction.js';
import asyncHandler from './asyncHandlerFunction.js';
import paginationHandler from './paginationHandler.js';
// import { number } from 'superstruct';
// import { CreateUser, PatchUser } from './structs.js';
// import { assert } from 'superstruct';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

// BigInt 값을 문자열로 변환하여 JSON 응답 생성
const replacer = (key, value) => {
  return typeof value === 'bigint' ? value.toString() : value;
};

// 전체 기업 목록 조회
app.get('/api/startups', asyncHandler(async (req, res) => {
  const { offset = 0, limit = 10, order = 'id' } = req.query;
  // validation은 값이 들어오자마자 검사를 해야 큰 실수를 줄일 수 있음.
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);

  const orderBy = orderByStartup(order);
  const startups = await prisma.startup.findMany({
    orderBy,
    skip: offsetNum,
    take: limitNum,
    include: { Category: true}
  });

  const responseData = await paginationHandler(startups, offsetNum, limitNum);

  // BigInt 값을 문자열로 변환하여 JSON 응답 생성
  res.send(JSON.stringify(responseData, replacer));
}));

// 전체 기업 검색 기능(여기에 혁진님 거 넣어주시면 됩니다.)
app.get("/api/startups/search", asyncHandler(async (req, res) => {
  const { keyword, offset = 0, limit = 10 } = req.query;
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);

  const startups = await prisma.startup.findMany({
    skip: offsetNum,
    take: limitNum,
    where: {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ]
    },
  });
  res.send(JSON.stringify(startups, replacer));
}));

// 내 기업과 비교 대상 기업들 비교하기(정렬, /api/startups/comparsion)

/**
 * id와 같은 동적 url은 search 기능 하단에 배치하는 것이 좋다.
 */
// 특정 기업 상세 조회(GET: /api/startups/{startupsId})
app.get("/api/startups/:startupsId",
  asyncHandler(async (req, res) => {

    const { startupsId } = req.params;
    const idNum = parseInt(startupsId, 10);
    const startup = await prisma.startup.findUniqueOrThrow({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  }));

/**
 * 선택한 기업의 상하 각각 2개의 랭크에 해당하는 기업이 보여야 함.
 */
// 내 기업의 순위와 근접한 순위의 기업 정보 확인
//(GET: /api/startups/{ startupsId }/rank)
app.get("/api/startups/:startupsId/rank",
  asyncHandler(async (req, res) => {

    const { startupsId } = req.params;
    const idNum = parseInt(startupsId);
    const startup = await prisma.startup.findMany({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  }));

// 기업 선택 횟수 조회
app.get('/api/selections', asyncHandler(async (req, res) => {
  const { offset = 0, limit = 10, order = 'countDesc' } = req.query;
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);

  const orderBy = orderByStartup(order);
  const startups = await prisma.startup.findMany({
    orderBy,
    skip: offsetNum,
    take: limitNum,
    include: { Category: true}
  });

  const responseData = await paginationHandler(startups, offsetNum, limitNum);

  // BigInt 값을 문자열로 변환하여 JSON 응답 생성
  res.send(JSON.stringify(responseData, replacer));
}));

// 나의 기업 선택하기(POST: /api/selections/{startupId}/myStartup)

// 비교 기업 선택하기(POST: /api/selections/{startupId}/compareStartup)

// 전체 투자 현황 조회
app.get('/api/investments', asyncHandler(async (req, res) => {
  const { offset = 0, limit = 10, order = 'simInvestDesc' } = req.query;
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);

  const orderBy = orderByStartup(order);
  const startups = await prisma.startup.findMany({
    orderBy,
    skip: offsetNum,
    take: limitNum,
    include: { Category: true}
  });

  const responseData = await paginationHandler(startups, offsetNum, limitNum);

  // BigInt 값을 문자열로 변환하여 JSON 응답 생성
  res.send(JSON.stringify(responseData, replacer));
}));

// 특정 기업에 투자하기(POST: /api/investmentts/{investmentId})

// 투자 수정(PATCH: /api/investmentts/{investmentId})

// 투자 삭제(DELETE: /api/investmentts/{investmentId})

// 프론트랑 겹치니깐 8000으로 바꿈.
const port = process.env.PORT || 8001;

app.listen(port, () => console.log(`Server Started :${port}`));
