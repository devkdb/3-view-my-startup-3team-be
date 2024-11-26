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
app.use(cors({ origin: "*", credentials: true }));

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
    const { searchKeyword, offset = 0, limit = 10, order = "id" } = req.query;
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

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
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
    let compareIdsArray = [];
    if (compareIds) {
      compareIdsArray = compareIds.split(",").map((id) => parseInt(id, 10));
    }
    const limitNum = Math.min(parseInt(limit), 5);
    const orderBy = orderByStartup(order);
    const selectedStartup = await prisma.startup.findUnique({
      where: { id: startupIdNum },
      include: { Category: true },
    });
    if (!selectedStartup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    const comparisonStartups = await prisma.startup.findMany({
      where: {
        id: { in: compareIdsArray },
        NOT: { id: selectedStartup.id },
      },
      orderBy: orderBy,
      take: limitNum,
      include: { Category: true },
    });
    const responseData = {
      startups: comparisonStartups,
    };
    res.send(JSON.stringify(responseData, replacer));
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
    const { order = "revenueDesc" } = req.query;
    const { startupsId } = req.params;
    const idNum = parseInt(startupsId);
    const orderBy = orderByStartup(order);

    const allStartups = await prisma.startup.findMany({
      orderBy,
      include: { Category: true },
    });

    const selectStartupIndex = allStartups.findIndex(
      (startup) => startup.id === idNum
    );
    let selectStartupRank = [
      allStartups[selectStartupIndex - 2],
      allStartups[selectStartupIndex - 1],
      allStartups[selectStartupIndex],
      allStartups[selectStartupIndex + 1],
      allStartups[selectStartupIndex + 2],
    ];

    if (allStartups[selectStartupIndex - 2] === undefined) {
      selectStartupRank.shift();
      selectStartupRank.push(allStartups[selectStartupIndex + 3]);
    }
    if (allStartups[selectStartupIndex - 1] === undefined) {
      selectStartupRank.shift();
      selectStartupRank.push(allStartups[selectStartupIndex + 4]);
    }
    if (
      allStartups[selectStartupIndex + 1] === undefined &&
      allStartups[selectStartupIndex + 2] !== undefined
    ) {
      const arr = selectStartupRank.filter((item) => item);
      selectStartupRank.splice(0);
      selectStartupRank.push(...arr);
      selectStartupRank.unshift(allStartups[selectStartupIndex - 3]);
      selectStartupRank.unshift(allStartups[selectStartupIndex - 4]);
    }

    if (allStartups[selectStartupIndex + 2] === undefined) {
      const arr = selectStartupRank.filter((item) => item);
      selectStartupRank.splice(0);
      selectStartupRank.push(...arr);
      selectStartupRank.unshift(allStartups[selectStartupIndex - 3]);
      selectStartupRank.unshift(allStartups[selectStartupIndex - 4]);
    }

    res.send(JSON.stringify(selectStartupRank, replacer));
  })
);

// 기업 선택 횟수 조회
app.get(
  "/api/selections",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "selectCountDesc" } = req.query;
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

// 비교 기업 선택하기(PATCH: /api/selections/?startupId=2&compareIds=4,8,17,25,33)
app.patch("/api/startups/selections", async (req, res) => {
  const { startupId, compareIds } = req.query;

  if (!startupId) {
    return res.status(400).json({ error: "startupId is required" });
  }

  const startupIdNum = parseInt(startupId, 10);
  if (isNaN(startupIdNum)) {
    return res.status(400).json({ error: "Invalid startupId format" });
  }

  let compareIdsArray = [];
  if (compareIds) {
    compareIdsArray = compareIds
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
  }

  try {
    // 트랜잭션 시작
    const [updatedSelectStartup] = await prisma.$transaction([
      // 선택된 스타트업의 count 증가 후 현재 count 가져오기
      prisma.startup.update({
        where: { id: startupIdNum },
        data: {
          selectCount: {
            increment: 1,
          },
        },
        select: { selectCount: true }, // count 값만 가져오기
      }),

      // 비교 대상 기업들의 compareCount 증가
      prisma.startup.updateMany({
        where: { id: { in: compareIdsArray } },
        data: {
          compareCount: {
            increment: 1,
          },
        },
      }),
    ]);

    // 선택된 스타트업의 전체 정보와 카테고리 정보 가져오기
    const selectedStartup = await prisma.startup.findUnique({
      where: { id: startupIdNum },
      include: { Category: true }, // 카테고리 정보 포함
    });

    // 업데이트 후 비교 대상 기업들의 모든 정보와 카테고리 정보 가져오기
    const updatedCompareStartups = await prisma.startup.findMany({
      where: { id: { in: compareIdsArray } },
      include: { Category: true }, // 카테고리 정보 포함
    });

    // 응답 데이터 형식화
    const responseData = {
      selectedStartup: selectedStartup, // 선택된 스타트업의 전체 정보와 카테고리
      compareStartups: updatedCompareStartups, // 비교 대상 기업들의 모든 정보와 카테고리
    };

    // BigInt 값들을 처리한 후 JSON 응답
    res.send(JSON.stringify(responseData, replacer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// 내가 선택한 기업의 투자자 정보 얻어오기
app.get(
  "/api/investors",
  asyncHandler(async (req, res) => {
    const { startupId, offset = 0, limit = 5 } = req.query;

    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);
    const idNum = parseInt(startupId, 10);

    console.log(`offsetNum:${offsetNum}, limitNum:${limitNum}, idNum:${idNum}`);

    // 쿼리 파라미터 검증
    if (!startupId || isNaN(idNum)) {
      return res.status(400).send({ error: "Invalid startupId" });
    }

    if (isNaN(offsetNum) || isNaN(limitNum)) {
      return res.status(400).send({ error: "Invalid offset or limit" });
    }

    // 전체 투자자 수 가져오기
    const totalInvestors = await prisma.mockInvestor.count({
      where: { startupId: idNum }, // startupId 기준으로 필터링. 해당 기업에 투자한 투자자 정보만 가져온다.
    });

    // 페이지네이션을 적용한 데이터 가져오기
    const paginatedInvestors = await prisma.mockInvestor.findMany({
      where: { startupId: idNum },
      orderBy: { investAmount: "desc" }, // investAmount 기준으로 내림차순 정렬. 투자 금액이 큰 순서대로 정렬
      skip: offsetNum,
      take: limitNum,
    });

    // 랭킹 부여
    const rankedInvestors = paginatedInvestors.map((investor, index) => ({
      ...investor,
      rank: offsetNum + index + 1, // 현재 페이지에 대한 랭킹 부여
    }));

    //const currentPage = Math.floor(offsetNum / limitNum) + 1; // 현재 페이지 계산
    //const totalPages = Math.ceil(totalInvestors / limitNum); // 총 페이지 수 계산
    //const hasNextPage = offsetNum + limitNum < totalInvestors; // 다음 페이지 존재 여부 확인

    const responseData = {
      totalInvestors,
      //currentPage,
      //totalPages,
      //hasNextPage,
      investors: rankedInvestors,
    };

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
        id: numId,
      },
    });
    const serializedStartups = JSON.stringify(updateInvest, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// 투자 삭제(DELETE: /api/investments/{investmentId})
app.delete("/api/investments/test/:id", async (req, res) => {
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

// 투자 삭제 라우트 (asyncHandler 사용, password 비교)
app.delete(
  "/api/investments/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const numId = parseInt(id, 10);

    console.log(`numId:${numId}, password:${password}`);

    // 투자 정보 조회
    const deleteInvest = await prisma.mockInvestor.findUnique({
      where: { id: numId },
    });

    // 투자 정보 존재 여부 확인
    if (!deleteInvest) {
      const error = new Error("투자정보가 존재하지 않습니다");
      error.status = 404;
      throw error;
    }

    // 비밀번호 일치 여부 확인
    if (deleteInvest.password !== password) {
      const error = new Error("비밀번호가 일치하지 않습니다");
      error.status = 401;
      throw error;
    }

    // 비밀번호 일치하면 삭제 진행
    await prisma.mockInvestor.delete({ where: { id: numId } });

    return res
      .status(200)
      .send({ message: "투자 정보 게시글이 삭제되었습니다" });
  })
);

// 프론트랑 겹치니깐 8000으로 바꿈.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
