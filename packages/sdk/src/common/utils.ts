import { random } from "lodash";
import BigNumber from "bignumber.js";
import { ERC20, ERC20__factory } from "../../typechain-types";
import { AddressZero } from "@ethersproject/constants";
import { getChainProvider } from "../factory/chain-provider";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Wallet } from "ethers";

export async function withInterval<T>(
  func: () => Promise<T | undefined>
): Promise<T> {
  const updates = await func();
  if (updates) {
    return updates;
  }
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const updates = await func();
      if (updates) {
        clearInterval(interval);
        resolve(updates);
      }
    }, random(15000, 30000));
  });
}


export async function fetchGet(url: string, params: any) {
  const response: any = await fetch(`${url}?${(new URLSearchParams(params)).toString()}`, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'application/json'
    },
  });

  return response.json();
}

export function getWallet(pkOrSigner: string | JsonRpcSigner, chainID: number) {
  if(typeof pkOrSigner === 'string') 
    return new Wallet(pkOrSigner, getChainProvider(chainID));
  
  return pkOrSigner;
}
