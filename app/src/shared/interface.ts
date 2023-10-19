export interface Config {
  RPC_URL: string;
  DEPLOY_SAFE: {
    OWNERS: string[];
    THRESHOLD: number;
    SALT_NONCE: number;
  };
}
