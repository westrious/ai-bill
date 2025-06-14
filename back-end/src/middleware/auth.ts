import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { user_id: userId } = req.body;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.sub !== userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
}
