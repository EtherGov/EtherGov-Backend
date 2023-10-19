import * as LitJsSdk from "@lit-protocol/lit-node-client";

export const litNodeClient = new LitJsSdk.LitNodeClient({
  alertWhenUnauthorized: false,
  litNetwork: "serrano",
  debug: true,
});
