export const envConfigMappings: {
  [chainId: number]: {
    factory_module_address: string;
  };
} = {
  11155111: {
    factory_module_address: "0xb6ab1c0e93411ace62e16918583be3a327669828", //https://sepolia.etherscan.io/address/0xb6ab1c0e93411ace62e16918583be3a327669828
  },
  80001: {
    factory_module_address: "0x708afF01719063e4675bE9410D7F8CD8Af700609",
  },
};
