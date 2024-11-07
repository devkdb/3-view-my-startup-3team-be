import * as dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";

const CATEGORIES = [
  "FASHION",
  "BEAUTY",
  "SPORTS",
  "ELECTRONICS",
  "HOME_INTERIOR",
  "HOUSEHOLD_SUPPLIES",
  "KITCHENWARE",
];

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
