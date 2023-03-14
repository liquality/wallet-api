import { ethers } from "ethers";
import { CHAINS, CHAIN_IDS } from "../common/constants";
import { Config } from "../common/config";
import {Biconomy} from "@biconomy/mexa";
///@ts-ignore
import {Biconomy as BiconomyForServer} from "biconomy/mexaforbackend";
import { ExternalProvider, JsonRpcProvider, BaseProvider, Web3Provider } from "@ethersproject/providers";


const chainProviderCache: Record<number, BaseProvider> = {};

export function getChainProvider(chainId: number, options?: {provider?: ExternalProvider, isGasless?: boolean}): BaseProvider | Web3Provider {
  if(options?.isGasless) return gaslessProvider(chainId, options?.provider);
  else if(options?.provider) return new Web3Provider(options.provider);
  return chainProviderCache[chainId] ? chainProviderCache[chainId] : createChainProvider(chainId);
}

export function createChainProvider(chainId: number) {
  const chainProviderOptions = {
    ...(Config.ALCHEMY_API_KEY && { alchemy: Config.ALCHEMY_API_KEY }),
    ...(Config.ETHERSCAN_API_KEY && { etherscan: Config.ETHERSCAN_API_KEY }),
    ...(Config.INFURA_PROJECT_ID && { infura: Config.INFURA_PROJECT_ID }),
    ...(Config.POCKET_NETWORK_APPLICATION_ID && {
      pocket: Config.POCKET_NETWORK_APPLICATION_ID,
    }),
    ...(Config.QUORUM && {
      quorum: Config.QUORUM,
    }),
  };

  
  let chainProvider;
  if (chainId === CHAIN_IDS.BNB_MAINNET) {
    chainProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', 56);
  } else if (chainId === CHAIN_IDS.MATIC_MUMBAI) {
    chainProvider = new ethers.providers.JsonRpcProvider(CHAINS[chainId].providerRPCs.ALCHEMY+Config.ALCHEMY_API_KEY , 80001);
  } 
  else {
    chainProvider = ethers.getDefaultProvider(
      chainId,
      chainProviderOptions
    );
  }

  chainProviderCache[chainId] = chainProvider;
  return chainProvider
}

function gaslessProvider(chainId: number, provider?: ExternalProvider) {

  let rpc = CHAINS[chainId].providerRPCs.ALCHEMY+Config.ALCHEMY_API_KEY || 
  CHAINS[chainId].providerRPCs.INFURA+Config.INFURA_PROJECT_ID;

  if (!provider) {
    const biconomyForServer = new BiconomyForServer(new JsonRpcProvider(rpc), {
      apiKey: Config.BICONOMY_API_KEY,
    });
    return biconomyForServer.getEthersProvider();
  } 

  
  let biconomyOption = {
    apiKey: Config.BICONOMY_API_KEY,
    contractAddresses: []
  } 

  const biconomy = new Biconomy(provider, biconomyOption);
  return new ethers.providers.Web3Provider(biconomy.provider);

}