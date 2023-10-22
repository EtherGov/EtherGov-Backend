export const envConfigMappings: {
  [chainId: number]: {
    factory_module_address: string;
  };
} = {
  11155111: {
    factory_module_address: "0x6A094B75b40C72C868d298F521D8fB78A40a3Cc4", //https://sepolia.etherscan.io/address/0xb6ab1c0e93411ace62e16918583be3a327669828
  },
  80001: {
    factory_module_address: "0xcdfea4b150036439f2d6f71fd04244752e211d81",
  },
  5001: {
    factory_module_address: "",
  },
};

export const envConfigMappingsChainModule: {
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
  5001: {
    factory_module_address: "0xF945EB0Ff08646d8322A37e0FffFC6Dc3d41CD3D",
  },
};
