import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { chatRoutes } from "./src/chatRoute";
import { recordRoutes } from "./src/recordRoute";
import authMiddleware from "./src/middleware/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use("/chat", chatRoutes);
app.use("/record", recordRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
