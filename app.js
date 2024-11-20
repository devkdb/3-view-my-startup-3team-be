import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { number } from "superstruct";
// import { CreateUser, PatchUser } from './structs.js';
// import { assert } from 'superstruct';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const corsOption = {
  origin: [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://viewmystatup-db.onrender.com/startups/",
  ],
};
app.use(cors(corsOption));

// function asyncHandler(handler) {
//   return async function (req, res) {
//     try {
//       await handler(req, res);
//     } catch (e) {
//       if (e.name === 'StructError' ||
//         e instanceof Prisma.PrismaClientValidationError
//       ) {
//         res.status(400).send({ message: e.message });
//       } else if (
//         e instanceof Prisma.PrismaClientKnownRequestError &&
//         e.code === 'P2025'
//       ) {
//         res.sendStatus(404);
//       } else {
//         res.status(500).send({ message: e.message });
//       }
//     }
//   };
// }

// BigInt 값을 문자열로 변환하여 JSON 응답 생성
function replacer(key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}

// 기업 전체 조회
app.get("/startups", async (req, res) => {
  const { offset = 0, limit = 10, order = "id" } = req.query;
  let orderBy;
  switch (order) {
    case "id":
      orderBy = { id: "asc" };
      break;
  }
  try {
    const startups = await prisma.startup.findMany({
      include: { Category: true },
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
    }); // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    const serializedStartups = JSON.stringify(startups, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// 내 기업과 비교 대상 기벙들 비교하기 (정렬)
// api: /startups/comparison GET
// app.get("/startups/comparison", async (req, res) => {}

// 검색 기능
app.get("/startups/search", async (req, res) => {
  const { searchKeyword, offset = 0, limit = 10 } = req.query;
  try {
    const startup = await prisma.startup.findMany({
      orderBy: { id: "asc" },
      skip: parseInt(offset),
      take: parseInt(limit),
      where: {
        name: { contains: searchKeyword },
      },
    });
    const serializedStartups = JSON.stringify(startup, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

//특정 기업 상세 조회
app.get("/startups/:id", async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: numId },
    });
    const serializedStartups = JSON.stringify(startup, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// 내 기업의 순위와 근접한 순위의 기업 정보 확인
// api: /startups/{companyId}/rank GET
// app.get("/startups/id/rank", async (req, res) => {}

// 기업 선택 횟수 조회
app.get("/selections", async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try {
    const select = await prisma.startup.findMany({
      select: {
        name: true,
        count: true,
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { id: "asc" },
    });
    res.status(200).send(select);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// 전체 투자 현황 조회
// api: /investments GET
// app.get("/investments", async (req, res) => {}

// 특정기업에 투자하기
// api: /investments POST
// app.post("/investments", async (req, res) => {}

// 투자 수정
// api: /investments/{investmentid} PUT
// app.patch("/investments/:investmentid", async (req, res) => {}

// 투자 삭제
// api: /investments/{investmentid} DELETE
// app.delete("/investments/:investmentid", async (req, res) => {}

// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
