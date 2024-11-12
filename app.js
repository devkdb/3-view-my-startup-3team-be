import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
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
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
    }); // BigInt 값을 문자열로 변환하여 JSON 응답 생성 
    const serializedStartups = JSON.stringify(startups, replacer); res.send(serializedStartups);
    
  } catch (error) { res.status(500).send({ message: error.message }); }
});

// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
