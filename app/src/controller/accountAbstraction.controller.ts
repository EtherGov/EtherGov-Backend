import { Request, Response } from "express";
import { getProvider } from "../services/provider";
import { ethers } from "ethers";
import { Config } from "../shared/interface";
import {
  createMultisig,
  deployModuleChain,
  listenModuleChain,
} from "../services/safe";
import { supabase } from "../services/supabase";

export class AccountAbstractionController {
  deployAAWallet = async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const { chainId, deployer, governanceAddress } = req.body;

      if (!chainId || !deployer || !governanceAddress) {
        return res.status(400).json({ message: "Invalid params" });
      }

      console.log(process.env.DEPLOY_SAFE_PRIVATE_KEY);

      const provider = getProvider(chainId);

      console.log(provider);

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

      const { data, error } = await supabase
        .from("aa_wallet")
        .select("*")
        .eq("contract_address", governanceAddress);

      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (data.length > 0) {
        const result = await createMultisig(config, signer);

        //This will allow to insert the wallet address in the entries table
        const { data: data3, error: erro3 } = await supabase
          .from("entries_aa")
          .insert({ wallet_address: result, chain_id: chainId })
          .select("*");

        const [tx_hash, moduleAddress] = await Promise.all([
          deployModuleChain(result, chainId),
          listenModuleChain(result, chainId),
        ]);
        //Here it will insert the wallet address inside the array so that it would be able to query on the entries table
        const { data: data2, error: error2 } = await supabase
          .from("aa_wallet")
          .update({ wallet_address: [...data[0].wallet_address, result] })
          .eq("contract_address", governanceAddress);

        if (error2 || erro3) {
          console.log(error2);
          console.log(erro3);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({ data: data2 });
      }

      const result = await createMultisig(config, signer);

      const { data: data3, error: error3 } = await supabase
        .from("entries_aa")
        .insert({ wallet_address: result, chain_id: chainId })
        .select("*");

      const [tx_hash, moduleAddress] = await Promise.all([
        deployModuleChain(result, chainId),
        listenModuleChain(result, chainId),
      ]);

      const { data: data2, error: error2 } = await supabase
        .from("aa_wallet")
        .insert({
          contract_address: governanceAddress,
          wallet_address: [result],
          deployer: deployer,
        })
        .select("*");

      if (error2 || error3) {
        console.log(error2);
        console.log(error3);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(200).json({ data: data2 });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
