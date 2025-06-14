import express, { Request, Response } from "express";
import { getRecords } from "./db";

export const recordRoutes = express.Router();

recordRoutes.post("/", async (req: Request, res: Response) => {
  const { user_id: userId, date } = req.body;

  const records = await getRecords(userId, new Date(date));

  res.status(200).json({
    records,
  });
});
