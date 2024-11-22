import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import orderByStartup from "./orderByFunction.js";
import asyncHandler from "./asyncHandlerFunction.js";
import paginationHandler from "./paginationHandler.js";
import { CreateInvest, PatchInvest } from "./structs.js";
import { assert } from "superstruct";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', credentials: true}));

// BigInt 값을 문자열로 변환하여 JSON 응답 생성
const replacer = (key, value) => {
  return typeof value === "bigint" ? value.toString() : value;
};

// 전체 기업 목록 조회
app.get(
  "/api/startups",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "id" } = req.query;
    // validation은 값이 들어오자마자 검사를 해야 큰 실수를 줄일 수 있음.
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);

// 전체 기업 검색 기능
app.get(
  "/api/startups/search",
  asyncHandler(async (req, res) => {
    const { searchKeyword, offset = 0, limit = 10 } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    if (!searchKeyword.trim()) {
      return res.status(400).send({ message: "검색어가 비어 있습니다." });
    }

    const totalCount = await prisma.startup.count({
      where: {
        name: { contains: searchKeyword, mode: "insensitive" },
      },
    });

    const startups = await prisma.startup.findMany({
      orderBy: { id: "asc" },
      skip: offsetNum,
      take: limitNum,
      where: {
        name: { contains: searchKeyword, mode: "insensitive" },
      },
      include: { Category: true },
    });

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = offsetNum + limitNum < totalCount;

    res.send({
      totalCount,
      totalPages,
      hasNextPage,
      startups: startups.map((startup) =>
        JSON.parse(JSON.stringify(startup, replacer))
      ),
    });
  })
);

// 내 기업과 비교 대상 기업들 비교하기(정렬, /api/startups/comparsion)
app.get(
  "/api/startups/comparison",
  asyncHandler(async (req, res) => {
    const { startupId, compareIds, limit = 5, order = "id" } = req.query;
    if (!startupId) {
      return res.status(400).json({ error: "startupId is required" });
    }
    const startupIdNum = parseInt(startupId, 10);
    if (isNaN(startupIdNum)) {
      return res.status(400).json({ error: "Invalid startupId format" });
    }
    //진한님이 말해준 배열에서 생각해봄
    let compareIdsArray = [];
    if (compareIds) {
      compareIdsArray = compareIds.split(",").map((id) => parseInt(id, 10));
    }
    const limitNum = Math.min(parseInt(limit), 5); //limit을 최대 5로 지정
    const orderBy = orderByStartup(order); // 정렬 기준
    try {
      //내가 선택한 기업
      const selectedStartup = await prisma.startup.findUnique({
        where: { id: startupIdNum },
        include: { Category: true },
      });
      if (!selectedStartup) {
        return res.status(404).json({ error: "Startup not found" }); //없으면 오류
      }
      //비교할 기업
      const comparisonStartups = await prisma.startup.findMany({
        where: {
          id: { in: compareIdsArray },
          NOT: { id: selectedStartup.id }, //내가 선택한 기업은 제외
        },
        orderBy: orderBy,
        take: limitNum,
        include: { Category: true },
      });
      const responseData = {
        startups: comparisonStartups,
      };
      res.send(JSON.stringify(responseData, replacer));
    } catch (error) {
      //예외처리
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
);

/**
 * id와 같은 동적 url은 search 기능 하단에 배치하는 것이 좋다.
 */
// 특정 기업 상세 조회(GET: /api/startups/{startupsId})
app.get(
  "/api/startups/:startupsId",
  asyncHandler(async (req, res) => {
    const { startupsId } = req.params;
    const idNum = parseInt(startupsId, 10);
    const startup = await prisma.startup.findUniqueOrThrow({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  })
);

/**
 * 선택한 기업의 상하 각각 2개의 랭크에 해당하는 기업이 보여야 함.
 */
// 내 기업의 순위와 근접한 순위의 기업 정보 확인
//(GET: /api/startups/{ startupsId }/rank)
app.get(
  "/api/startups/:startupsId/rank",
  asyncHandler(async (req, res) => {
    const { startupsId } = req.params;
    const idNum = parseInt(startupsId);
    const startup = await prisma.startup.findMany({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  })
);

// 기업 선택 횟수 조회
app.get(
  "/api/selections",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "countDesc" } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);

// 나의 기업 선택하기(POST: /api/selections/{startupId}/myStartup)

// 비교 기업 선택하기(POST: /api/selections/{startupId}/compareStartup)

// 전체 투자 현황 조회
app.get(
  "/api/investments",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "simInvestDesc" } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);

// 특정 기업에 투자하기(POST: /api/investments)
app.post("/api/investments", async (req, res) => {
  assert(req.body, CreateInvest);
  try {
    const createdInvest = await prisma.mockInvestor.create({
      data: req.body,
    });
    const serializedInvest = JSON.stringify(createdInvest, replacer);
    res.send(serializedInvest);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// 투자 수정(PATCH: /api/investments/{investmentId})
app.patch("/api/investments/:id", async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  assert(req.body, PatchInvest);
  try {
    const updateInvest = await prisma.mockInvestor.update({
      data: req.body,
      where: {
        startupId: numId,
      },
    });
    const serializedStartups = JSON.stringify(updateInvest, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// 투자 삭제(DELETE: /api/investments/{investmentId})
app.delete("/api/investments/:id", async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  const deleteInvest = await prisma.mockInvestor.findUnique({
    where: {
      id: numId,
    },
  });
  if (!deleteInvest) {
    return res.status(404).send({ message: "투자가 존재하지 않습니다" });
  }
  await prisma.mockInvestor.delete({ where: { id: numId } });
  return res.status(200).send({ message: "게시글이 삭제 되었습니다" });
});

// 프론트랑 겹치니깐 8000으로 바꿈.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
