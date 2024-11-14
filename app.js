import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { number } from 'superstruct';
// import { CreateUser, PatchUser } from './structs.js';
// import { assert } from 'superstruct';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

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
  return typeof value === 'bigint' ? value.toString() : value;
}

//전체 기업 조회
app.get('/startups', async (req, res) => {
  const { offset = 0, limit = 10, order = 'id' } = req.query;
  let orderBy;
  switch (order) {
    case 'id':
      orderBy = { id: 'asc' };
      break;
  }
  try {
    const startups = await prisma.startup.findMany({
      include:{category: true},
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
      incluede:{category:true},
    }); // BigInt 값을 문자열로 변환하여 JSON 응답 생성 
    const serializedStartups = JSON.stringify(startups, replacer); res.send(serializedStartups);
    
  } catch (error) { res.status(500).send({ message: error.message }); }
});

//특정 기업 상세 조회
app.get("/startups/:id", async (req, res) => {
  const {id} = req.params;
  const numId = parseInt(id, 10);
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: numId },
    });
    const serializedStartups = JSON.stringify(startup, replacer); res.send(serializedStartups);
  }catch(error) {res.status(404).send({message: error.message}); }
});

//검색 기능
app.get("/startups/search", async (req, res) => {
  const { searchKeyword, offset = 0, limit = 10} =req.query;
  try {
    const startup = await prisma.startup.findMany({
      orderBy: {id: "asc"},
      skip: parseInt(offset),
      take: parseInt(limit),
      where:{
          name: {contains: searchKeyword},
      },
    });
    const serializedStartups = JSON.stringify(startup, replacer); res.send(serializedStartups);
  }catch(error){res.status(404).send({message: error.message}); }
})


//기업 선택 횟수 조회
app.get('/selection', async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try{
    const select = await prisma.startup.findMany({
      select: {
        name:true, 
        count:true,
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: {id: "asc"},
    });
    res.status(200).send(select);
  } catch(error) {res.status(400).send({message:error.message});}
})

//전체 투자 현황 조회


//특정기업에 투자하기




// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
