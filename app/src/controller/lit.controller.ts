import { Request, Response } from "express";
import { litNodeClient } from "../services/lit";
import dotenv from "dotenv";

dotenv.config();

export class LitController {
  checkNFT = async (req: Request, res: Response) => {
    try {
      const { address, contractAddress, authSig, publicKey } = req.body;

      if (!address || !contractAddress || !authSig) {
        return res.status(400).json({ message: "Invalid params" });
      }

      const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_API_KEY}/isHolderOfCollection?wallet=${address}&contractAddress=${contractAddress}`;
      const litAction = `
        const checkUserOwnNFT = async() => {
            const resp = await fetch(url).then((response) => response.json());
            // if(resp.isHolderOfCollection === false){
            //     return
            // }
            const sigShare = await LitActions.signEcdsa({toSign, publicKey , sigName});
        }

        checkUserOwnNFT();
        `;

      await litNodeClient.connect();

      const signatures = await litNodeClient.executeJs({
        code: litAction,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
          url,
          // this is the string "Hello World" for testing
          toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
          publicKey: publicKey,
          sigName: "sig1",
        },
      });

      return res.status(200).json({ signatures });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
