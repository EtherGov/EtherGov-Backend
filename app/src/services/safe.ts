import Safe, {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
  SafeConfig,
} from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { Config } from "../shared/interface";
import { getProvider } from "./provider";
import FactoryModule from "../../abi/FactoryModuleHub.json";
import ModuleFactory from "../../abi/ModuleFactory.json";
import { supabase } from "./supabase";
import {
  envConfigMappings,
  envConfigMappingsChainModule,
} from "../shared/config";

export const createMultisig = async (config: Config, signer: ethers.Wallet) => {
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

export const deployModule = async (chainId: number) => {
  const provider = getProvider(chainId);
  const signer = new ethers.Wallet(
    process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
    provider
  );
  const address = envConfigMappings[chainId].factory_module_address;
  //https://sepolia.etherscan.io/address/0xb6ab1c0e93411ace62e16918583be3a327669828
  const contract = new ethers.Contract(address, FactoryModule.abi, signer);
  const executeDeploy = await contract.createModule();
  console.log(executeDeploy);
  const tx = await executeDeploy.wait();
  console.log(tx);
  return tx;
};

export const addModule = async (
  safeAddress: string,
  chainId: number,
  moduleAddress: string
) => {
  const provider = getProvider(chainId);

  const signer = new ethers.Wallet(
    process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
    provider
  );

  const config: SafeConfig = {
    safeAddress: safeAddress,
    ethAdapter: new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    }),
  };

  const safeAccount = await Safe.create(config);

  console.log(safeAccount);

  const addMod = await safeAccount.createEnableModuleTx(moduleAddress);
  const execute = await safeAccount.executeTransaction(addMod);
  const tx = await execute.transactionResponse?.wait();
  console.log(tx);
  return tx;
};

export const listenModule = (governanceAddress: string, chainId: number) => {
  return new Promise(async (resolve, reject) => {
    const provider = getProvider(chainId);
    const signer = new ethers.Wallet(
      process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
      provider
    );
    const address = envConfigMappings[chainId].factory_module_address;
    const contract = new ethers.Contract(address, FactoryModule.abi, signer);

    contract.on("ModuleCreated", async (moduleAddress: string) => {
      console.log(moduleAddress);
      try {
        const { data } = await supabase
          .from("governance_contract")
          .update({
            module_address: moduleAddress,
          })
          .eq("contract_address", governanceAddress);

        resolve(moduleAddress);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const deployModuleChain = async (
  safeAddress: string,
  chainId: number
) => {
  const provider = getProvider(chainId);
  const signer = new ethers.Wallet(
    process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
    provider
  );
  const address = envConfigMappingsChainModule[chainId].factory_module_address;
  //https://sepolia.etherscan.io/address/0xb6ab1c0e93411ace62e16918583be3a327669828
  const contract = new ethers.Contract(address, ModuleFactory.abi, signer);
  const executeDeploy = await contract.createModule(
    signer.address,
    safeAddress
  );
  console.log(executeDeploy);
  const tx = await executeDeploy.wait();
  console.log(tx);
  return tx;
};

export const listenModuleChain = (aaAddress: string, chainId: number) => {
  return new Promise(async (resolve, reject) => {
    const provider = getProvider(chainId);
    const signer = new ethers.Wallet(
      process.env.DEPLOY_SAFE_PRIVATE_KEY || "",
      provider
    );
    const address =
      envConfigMappingsChainModule[chainId].factory_module_address;
    const contract = new ethers.Contract(address, ModuleFactory.abi, signer);

    contract.on("ModuleCreated", async (moduleAddress: string) => {
      console.log(moduleAddress);
      try {
        const { data } = await supabase
          .from("entries_aa")
          .update({
            module_address: moduleAddress,
          })
          .eq("wallet_address", aaAddress);

        resolve(moduleAddress);
      } catch (error) {
        reject(error);
      }
    });
  });
};
