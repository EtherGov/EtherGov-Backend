import { Router } from "express";
import { AccountAbstractionController } from "../controller/accountAbstraction.controller";

export const AccountAbstractionRouter = () => {
  const router = Router();
  const accountAbstractionController = new AccountAbstractionController();

  router.get("/", () => {
    console.log("test");
  });
  router.post("/deploy", accountAbstractionController.deployAAWallet);

  return router;
};
