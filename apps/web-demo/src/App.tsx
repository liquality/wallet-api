import { Login, CreateWallet } from "ui";
import { useState } from "react";
import { NftService, setup } from "@liquality/wallet-sdk";

const verifierMap: Record<string, any> = {
  google: {
    name: "Google",
    typeOfLogin: "google",
    clientId:
      "852640103435-0qhvrgpkm66c9hu0co6edkhao3hrjlv3.apps.googleusercontent.com",
    verifier: "liquality-google-testnet",
  },
};

// 1. Setup Service Provider
const directParams = {
  baseUrl: `http://localhost:3005/serviceworker`,
  enableLogging: true,
  networkUrl: "https://goerli.infura.io/v3/a8684b771e9e4997a567bbd7189e0b27",
  network: "testnet" as any,
};

export default function Web() {

  setup({
    alchemyApiKey:'',
    etherscanApiKey:"-",
    infuraProjectId:"-",
    pocketNetworkApplicationID:"-",
    quorum:1,
    slowGasPriceMultiplier:1,
    averageGasPriceMultiplier:1.5,
    fastGasPriceMultiplier:2,
    gasLimitMargin:2000,
    biconomyApiKey:"",
    biconomyContractAddresses:[]
  });

  const [address, setAddress] = useState<string>();
  /*  const [nfts, setNfts] = useState<Nft[] | null>([]);

  async function updateNfts() {
    if (!address) throw new Error("set address first");
    //const nfts = await NftService.getNfts(address, 1);
    console.log(nfts, "NFTS in my addr");
    setNfts(nfts);
  } */

  async function updateNfts() {
    // if (!address) throw new Error("set address first");
    // alert(window.ethereum.address)
    // const hash = await NftService.createERC721Collection({tokenName: "gaslessNft", tokenSymbol:"gnft"}, 80001,"", true);
        const hash = await NftService.mintERC721Token({contractAddress: "0x276d843c8c7f3aa6518b6ba119d92c6262dd3577", recipient:"0x97542289b1453eb8e9c0f4af562ef7eb354db75c", uri:"spark"}, 80001,"<private key>", true);

    console.log("hash => ",hash);
    // console.log(nfts, "NFTS in my addr");
    // setNfts(nfts);
  }

  return (
    <div>
      {/* <Login directParams={directParams} verifierMap={verifierMap} />
      <CreateWallet directParams={directParams} verifierMap={verifierMap} /> */}
      <hr />
      {/*  <div>
        NFT address:
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
        <button onClick={() => updateNfts()}>Get NFTS</button>
      </div>
      {nfts && (
        <div>
          <h2>Nft list</h2>
          {nfts.map((nft) => (
            <div>{nft.contract.name}</div>
          ))}
        </div>
      )} */}
      <button onClick={() => updateNfts()}>Get NFTS</button>
    </div>
  );
}
