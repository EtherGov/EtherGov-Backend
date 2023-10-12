import { Bundler } from "@biconomy/bundler";
import { providers, Wallet, ethers } from "ethers";
import dotenv from "dotenv";
import {
  Environment,
  StandardRelayerApp,
  StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { Next } from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_ETH } from "@certusone/wormhole-sdk";

dotenv.config();

const wallet = new Wallet(
  process.env.PRIVATE_KEY as string,
  new providers.AlchemyProvider("goerli", process.env.ALCHMEY_API_KEY)
);

const app = new StandardRelayerApp<StandardRelayerContext>(
  Environment.TESTNET,
  // other app specific config options can be set here for things
  // like retries, logger, or redis connection settings.
  {
    name: "ExampleRelayer",
  }
);

const sendSignature = async (ctx: StandardRelayerContext) => {
  let seq = ctx.vaa?.sequence.toString();
  ctx.logger.info(`chain middleware - ${seq} - ${ctx.sourceTxHash}`);
};

export const initRelayer = async () => {
  app.chain(CHAIN_ID_ETH).address(
    // emitter address on Solana
    "0xca51855fba4aae768dcc273349995de391731e70",
    // callback function to invoke on new message
    async (ctx, next) => {
      const vaa = ctx.vaa;
      const hash = ctx.sourceTxHash;
      console.log(
        `Got a VAA with sequence: ${vaa?.sequence} from with txhash: ${hash}`
      );
    }
  );
  await app.listen();
};

export const generateSignature = async (message: string) => {
  let signature = await wallet.signMessage(message);
  return signature;
};

export const batchWormHole = async () => {
  let wormHoleAddress = "0x706abc4E45D419950511e474C7B9Ed348A4a716c";
  let wormHoleAbi = [
    "function publishMessage(uint32 nonce ,bytes memory payload, uint8 consistencyLevel) public payable returns (uint64)",
  ];
  const signature = await generateSignature("test");
  const contract = new ethers.Contract(wormHoleAddress, wormHoleAbi, wallet);
  const tx = await contract.publishMessage(1, signature, 200);
  console.log(tx);
};
