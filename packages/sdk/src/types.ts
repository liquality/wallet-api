import ThresholdKey from "@tkey/default";
import type { TorusLoginResponse } from "@toruslabs/customauth";
import { ExternalProvider } from "@ethersproject/providers";
export interface ConfigParams {
  alchemyApiKey?: string;
  etherscanApiKey?: string;
  infuraProjectId?: string;
  pocketNetworkApplicationID?: string;
  quorum?: number;
  slowGasPriceMultiplier?: number;
  averageGasPriceMultiplier?: number;
  fastGasPriceMultiplier?: number;
  gasLimitMargin?: number;
  biconomyApiKey?: string
  biconomyContractAddresses?: string[]
}

export type KeyDetails = {
  pubKey: any;
  requiredShares: number;
  threshold: number;
  totalShares: number;
  shareDescriptions: ShareDescriptionMap;
};

export type ShareDescriptionMap = {
  [shareIndexStr: string]: string[];
};

export declare const TORUS_NETWORK: {
  readonly TESTNET: "testnet";
  readonly MAINNET: "mainnet";
  readonly CYAN: "cyan";
  readonly AQUA: "aqua";
  readonly CELESTE: "celeste";
};
export declare const NETWORK_MAP: {
  mainnet: string;
  testnet: string;
  cyan: string;
  aqua: string;
  celeste: string;
};
export type TORUS_NETWORK_TYPE =
  (typeof TORUS_NETWORK)[keyof typeof TORUS_NETWORK];


export type LoginResult = {
  tKey: ThresholdKey,
  loginResponse: TorusLoginResponse,
  tKeyDetails: KeyDetails
}

export type AccountToken = {
  tokenContractAddress: string | null
  tokenName: string | null
  tokenSymbol: string | null
  rawBalance: string | null
  formattedBalance: string | undefined
}

export type PKeyOrProvider = ExternalProvider | string 