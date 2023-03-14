import { Alchemy, Network } from "alchemy-sdk";
import { CHAIN_IDS } from "../common/constants";
import { Config } from "../common/config";

const chainIdToNetwork = {
  [CHAIN_IDS.ETH_MAINNET]: Network.ETH_MAINNET,
  [CHAIN_IDS.ETH_GOERLI]: Network.ETH_GOERLI,
  [CHAIN_IDS.OPT_MAINNET]: Network.OPT_MAINNET,
  [CHAIN_IDS.OPT_GOERLI]: Network.OPT_GOERLI,
  [CHAIN_IDS.ARB_MAINNET]: Network.ARB_MAINNET,
  [CHAIN_IDS.ARB_GOERLI]: Network.ARB_GOERLI,
  [CHAIN_IDS.MATIC_MAINNET]: Network.MATIC_MAINNET,
  [CHAIN_IDS.MATIC_MUMBAI]: Network.MATIC_MUMBAI,
  [CHAIN_IDS.ASTAR_MAINNET]: Network.ASTAR_MAINNET,
};

const alchemyProviderCache: Record<number, Alchemy> = {};
export function getAlchemyProvider(chainId: number) {
  if (alchemyProviderCache[chainId]) return alchemyProviderCache[chainId];
  return createAlchemyProvider(chainId);
}

export function createAlchemyProvider(chainId: number) {
  const settings = {
    apiKey: Config.ALCHEMY_API_KEY,
    network: chainIdToNetwork[chainId],
  };
  const alchemyProvider = new Alchemy(settings);
  alchemyProviderCache[chainId] = alchemyProvider;

  return alchemyProvider;
}
