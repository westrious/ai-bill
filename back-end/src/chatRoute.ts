import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createRecord } from "./db";

dotenv.config();

export const chatRoutes = express.Router();

const deepSeek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

chatRoutes.post("/", async (req: Request, res: Response) => {
  const { messages, user_id: userId } = req.body;

  const today = new Date().toISOString().split("T")[0];
  const prompt = `请你分析一下我的输入，如果是支出或收入记录，则按照 json 格式返回，不然就正常返回。
    格式如下：{"amount": 100, "title": "others", "date": "2025-01-01"}，规则是：
    1. 如果是支出，则 amount 是负数，如果是收入，则 amount 是正数；
    2. 如果是支出，则 title 是消费的商品或者服务，如果是收入，则 title 是收入的来源，如果分析不出来，则 title 是 "others"；
    3. 今天是${today}，如果能分析出日期，则 date 为分析出的日期，如果分析不出来，则 date 为今天；
    `;

  try {
    const { text } = await generateText({
      model: deepSeek("deepseek-chat"),
      system: prompt,
      messages,
    });

    const resJson = {
      text: "",
      record: null,
    };

    const record = parseResult(text);
    if (record) {
      if (
        await createRecord(userId, record.amount, record.title, record.date)
      ) {
        resJson.record = record;
      } else {
        resJson.text = "记录失败，请稍后重试";
      }
    } else {
      resJson.text = text;
    }
    res.status(200).json(resJson);
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({
      text: "服务异常，请稍后重试",
    });
  }
});

const parseResult = (result: string) => {
  try {
    // 清理一下可能存在的 markdown 格式
    const cleanedResult = result
      .replace(/```json\n/, "")
      .replace(/\n```/, "")
      .trim();
    const parsedResult = JSON.parse(cleanedResult);
    if (parsedResult.amount && parsedResult.title && parsedResult.date) {
      return parsedResult;
    }
    return null;
  } catch (error) {
    return null;
  }
};
