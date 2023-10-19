import { ethers } from "ethers";
import { SEPOLIA_CHAIN_ID } from "../shared/constant";

export function getProvider(chainId: number) {
  let provider;

  switch (chainId) {
    case SEPOLIA_CHAIN_ID:
      provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
      break;

    default:
      provider = new ethers.providers.JsonRpcProvider(
        "http://host.docker.internal:8545"
      );
  }
  return provider;
}
