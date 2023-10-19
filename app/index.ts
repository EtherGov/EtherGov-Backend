import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { litRouter } from "./src/routes/lit.router";
import { GovernanceRouter } from "./src/routes/governance.router";
import { AccountAbstractionRouter } from "./src/routes/accountAbstraction.router";

dotenv.config();

export const _app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3001;
_app
  .use(express.json())
  .use(cors())
  .use("/lit", litRouter())
  .use("/governance", GovernanceRouter())
  .use("/account", AccountAbstractionRouter());

_app.get("/test", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running test");
});

if (process.env.NODE_ENV !== "test") {
  _app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

export const app = _app;
