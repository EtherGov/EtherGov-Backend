import { Router } from "express";
import { LitController } from "../controller/lit.controller";

export const litRouter = () => {
  const router = Router();
  const litController = new LitController();

  router.post("/run-lit-action", litController.checkNFT);

  return router;
};
