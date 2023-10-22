import { Router } from "express";
import { GovernanceController } from "../controller/governance.controller";

export const GovernanceRouter = () => {
  const router = Router();
  const governanceController = new GovernanceController();

  router.post("/add-governance", governanceController.addGovernance);
  router.post("/execute-proposal", governanceController.executeProposal);
  router.get(
    "/get-vault/:governanceAddress",
    governanceController.getAllOwnerVault
  );
  return router;
};
