import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  batchWormHole,
  generateSignature,
  initRelayer,
} from "./src/services/WormHole/wormHole";

dotenv.config();

export const _app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
_app.use(express.json()).use(cors());

_app.get("/test", (req: Request, res: Response) => {
  batchWormHole();
  res.send("Express + TypeScript Server is running test");
});

if (process.env.NODE_ENV !== "test") {
  _app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
  initRelayer();
}

export const app = _app;
