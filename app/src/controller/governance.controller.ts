import Safe, {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
  SafeConfig,
} from "@safe-global/protocol-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { Contract, ethers } from "ethers";
import { Request, Response } from "express";
import { Config } from "../shared/interface";
import { getProvider } from "../services/provider";
import { supabase } from "../services/supabase";
import {
  addModule,
  createMultisig,
  deployModule,
  listenModule,
} from "../services/safe";

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

      const result = await createMultisig(config, signer);
      const [tx_hash, moduleAddress] = await Promise.all([
        deployModule(chainId),
        listenModule(governanceAddress, chainId),
      ]);

      console.log(moduleAddress);

      const addMod = await addModule(result, chainId, moduleAddress as string);
      console.log(addMod);
      const { data, error } = await supabase
        .from("governance_contract")
        .insert({
          contract_address: governanceAddress,
          account_tank_address: result,
          deployer: deployer,
          chain_id: chainId,
          module_address: moduleAddress,
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

  executeProposal = async (req: Request, res: Response) => {
    try {
      const {
        governance_address,
        proposalId,
        councilAddress,
        tokenAddressSource,
        tokenAddressDestination,
        sourceValue,
        destinationValue,
      } = req.body;

      if (
        !governance_address ||
        !proposalId ||
        !councilAddress ||
        !tokenAddressSource ||
        !tokenAddressDestination ||
        !sourceValue ||
        !destinationValue
      ) {
        return res.status(400).json({ message: "Invalid params" });
      }

      const { data, error } = await supabase
        .from("governance_contract")
        .select("*")
        .eq("contract_address", governance_address);

      if (error)
        return res.status(500).json({ message: "Internal server error" });

      if (data.length === 0)
        return res.status(404).json({ message: "No governance found" });

      const provider = getProvider(data[0].chain_id);

      const signer = new ethers.Wallet(
        process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
        provider
      );

      const config: SafeConfig = {
        safeAddress: data[0].account_tank_address,
        ethAdapter: new EthersAdapter({
          ethers,
          signerOrProvider: signer,
        }),
      };

      const safeAccount = await Safe.create(config);
      const functionSignature = "execute(uint256)";
      const functionSelector = ethers.utils.id(functionSignature).slice(0, 10); // First 4 bytes of the keccak256 hash

      const encodedArguments = ethers.utils.defaultAbiCoder.encode(
        ["uint256"],
        [proposalId]
      );

      const finalData = functionSelector + encodedArguments.slice(2); // Concatenate and remove the '0x' from the encoded arguments

      console.log(finalData);

      const safeTransaction: SafeTransactionDataPartial = {
        to: governance_address,
        data: finalData,
        value: "0.001",
      };

      const prepareTransaction = await safeAccount.createTransaction({
        safeTransactionData: safeTransaction,
      });

      const isValidTx = await safeAccount.isValidTransaction(
        prepareTransaction
      );

      if (!isValidTx) {
        return res.status(400).json({ message: "Invalid transaction" });
      }

      const txHash = await safeAccount.executeTransaction(prepareTransaction);

      const resultHash = await txHash.transactionResponse?.wait();

      return res.status(200).json({ resultHash });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getAllOwnerVault = async (req: Request, res: Response) => {
    try {
      const { governanceAddress } = req.params;

      //find the wallet that exist owned by this governance address
      const { data, error } = await supabase
        .from("aa_wallet")
        .select("wallet_address")
        .eq("contract_address", governanceAddress);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      if (data.length === 0) {
        return res.status(200).json([{}]);
      }

      const { data: data2, error: error2 } = await supabase
        .from("entries_aa")
        .select("*")
        .in("wallet_address", data[0].wallet_address);

      if (error2) {
        return res.status(500).json({ message: error2.message });
      }

      return res.status(200).json(data2);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
