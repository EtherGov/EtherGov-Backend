import {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import { Contract, ethers } from "ethers";
import { Request, Response } from "express";
import { Config } from "../shared/interface";
import { getProvider } from "../services/provider";
import { supabase } from "../services/supabase";

export class GovernanceController {
  addGovernance = async (req: Request, res: Response) => {
    try {
      const { governanceAddress, chainId, deployer } = req.body;

      if (!governanceAddress || !chainId) {
        return res.status(400).json({ message: "Invalid params" });
      }

      const provider = getProvider(chainId);
      const signer = new ethers.Wallet(
        process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
        provider
      );

      const config: Config = {
        RPC_URL: "",
        DEPLOY_SAFE: {
          OWNERS: [signer.address],
          THRESHOLD: 1,
          SALT_NONCE: Date.now(),
        },
      };

      const result = await this.createMultisig(config, signer);

      const { data, error } = await supabase
        .from("governance_contract")
        .insert({
          contract_address: governanceAddress,
          account_tank_address: result,
          deployer: deployer,
        })
        .select("*");
      console.log(data);
      console.log(error);
      return res.status(200).json({ data });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  private createMultisig = async (config: Config, signer: ethers.Wallet) => {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    const safeFactory = await SafeFactory.create({
      ethAdapter,
    });

    const safeAccountConfig: SafeAccountConfig = {
      owners: config.DEPLOY_SAFE.OWNERS,
      threshold: config.DEPLOY_SAFE.THRESHOLD,
    };

    const saltNonce = config.DEPLOY_SAFE.SALT_NONCE;

    const predictedDeploySafeAddress = await safeFactory.predictSafeAddress(
      safeAccountConfig,
      saltNonce.toString()
    );

    console.log("Predicted deployed Safe address:", predictedDeploySafeAddress);

    function callback(txHash: string) {
      console.log("Transaction hash:", txHash);
    }

    // Deploy Safe
    const safe = await safeFactory.deploySafe({
      safeAccountConfig,
      saltNonce: saltNonce.toString(),
      callback,
    });
    const safeAddress = await safe.getAddress();

    console.log("Deployed Safe:", safeAddress);

    return safeAddress;
  };

  //   returnAllGovernance = async(req: Request, res: Response) => {
  //     try {
  //         const contract = new Contract("0x41f900be467060a3af9f02ffb44e36f0cebb02a3",)
  //     }catch(e){

  //     }
  //   }
}
