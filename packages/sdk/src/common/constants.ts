export const CHAIN_IDS = {
  ETH_MAINNET: 1,
  ETH_GOERLI: 5,
  OPT_MAINNET: 10,
  OPT_GOERLI: 420,
  ARB_MAINNET: 42161,
  ARB_GOERLI: 421613,
  MATIC_MAINNET: 137,
  MATIC_MUMBAI: 80001,
  ASTAR_MAINNET: 592,
  BNB_MAINNET: 56,
};

export const CHAINS = {
  [CHAIN_IDS.ETH_MAINNET]: {
    providerRPCs: {
      ALCHEMY: "https://eth-mainnet.g.alchemy.com/v2/",
      INFURA: "https://mainnet.infura.io/v3/"
    }
  },
  [CHAIN_IDS.ETH_GOERLI] : {
    providerRPCs: {
      ALCHEMY: "https://eth-goerli.g.alchemy.com/v2/",
      INFURA: "https://goerli.infura.io/v3/"
    }
  },
  [CHAIN_IDS.OPT_MAINNET] : {
    providerRPCs: {
      ALCHEMY: "https://opt-mainnet.g.alchemy.com/v2/",
      INFURA: "https://optimism-mainnet.infura.io/v3/"
    }
  },
  [CHAIN_IDS.OPT_GOERLI] : {
    providerRPCs: {
      ALCHEMY: "https://opt-goerli.g.alchemy.com/v2/",
      INFURA: "https://optimism-goerli.infura.io/v3/"
    }
  },
  [CHAIN_IDS.MATIC_MAINNET] : {
    providerRPCs: {
      ALCHEMY: "https://polygon-mumbai.g.alchemy.com/v2/",
      INFURA: "https://polygon-mainnet.infura.io/v3/"
    }
  },
  [CHAIN_IDS.MATIC_MUMBAI] : {
    providerRPCs: {
      ALCHEMY: "https://polygon-mumbai.g.alchemy.com/v2/",
      INFURA: "https://polygon-mumbai.infura.io/v3/"
    }
  },
  [CHAIN_IDS.ARB_MAINNET] : {
    providerRPCs: {
      ALCHEMY: "https://arb-mainnet.g.alchemy.com/v2/",
      INFURA: "https://arbitrum-mainnet.infura.io/v3/"
    }
  },
  [CHAIN_IDS.ARB_GOERLI] : {
    providerRPCs: {
      ALCHEMY: "https://arb-goerli.g.alchemy.com/v2/",
      INFURA: "https://arbitrum-goerli.infura.io/v3"
    }
  },
}

export const BICONOMY_TRUSTED_FORWARDERS = {
  [CHAIN_IDS.ETH_MAINNET]: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",
  [CHAIN_IDS.ETH_GOERLI]: "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792",
  [CHAIN_IDS.MATIC_MAINNET]: "0xf0511f123164602042ab2bCF02111fA5D3Fe97CD",
  [CHAIN_IDS.MATIC_MUMBAI]: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",
  [CHAIN_IDS.ARB_MAINNET]: "0xfe0fa3C06d03bDC7fb49c892BbB39113B534fB57",
  [CHAIN_IDS.OPT_MAINNET]: "0xEFbA8a2A82ec1fB1273806174f5E28FBb917Cf95",
  [CHAIN_IDS.OPT_GOERLI]: "0x9C73373C70F23920EA54F7883dCB1F85b162Df40",
  [CHAIN_IDS.BNB_MAINNET]: "0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8",
}