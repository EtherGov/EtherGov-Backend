import { ethers } from "ethers";
import {
  ARBITRUM_CHAIN_ID,
  MUMBAI_CHAIN_ID,
  SCROLL_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
} from "../shared/constant";

export function getProvider(chainId: number) {
  let provider;

  switch (chainId) {
    case SEPOLIA_CHAIN_ID:
      provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
      break;
    case MUMBAI_CHAIN_ID:
      provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
      break;
    case ARBITRUM_CHAIN_ID:
      provider = new ethers.providers.JsonRpcProvider(
        `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
      break;
    case SCROLL_CHAIN_ID:
      provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia-rpc.scroll.io`
      );
      break;

    default:
      provider = new ethers.providers.JsonRpcProvider(
        "http://host.docker.internal:8545"
      );
  }
  return provider;
}
