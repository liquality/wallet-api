import { BigNumber as EthersBigNumber, Contract, ethers, Wallet } from "ethers";
import { getChainProvider } from "../../factory/chain-provider";
import { TransactionService } from "../../transaction/transaction.service";
import { DebridgeConfig } from "./config";
import { FullSubmissionInfo, QuoteRequest, SwapRequest, SwapStatusRequest } from "./types";
import { fetchGet, getWallet, withInterval } from "../../common/utils";
import SignatureVerifier from "./abi/SignatureVerifier.json";
import { AddressZero } from "@ethersproject/constants";
import { ERC20, ERC20__factory } from "../../../typechain-types";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import BigNumber from "bignumber.js";
import { TX_STATUS } from "../../transaction/constants/transaction-status";
import { JsonRpcSigner, ExternalProvider } from "@ethersproject/providers";

export abstract class DebridgeSwapProvider {
  private static readonly config = DebridgeConfig;

  public static async swap(swapRequest: SwapRequest, pkOrProvider: string | ExternalProvider, isGasless: boolean) {
    // Validation
    const isSrcChainSupported = !!this.config.chains[swapRequest.srcChainId];
    const isDstChainSupported = !!this.config.chains[swapRequest.srcChainId];
    if (
      new BigNumber(swapRequest.srcChainTokenInAmount).lte(0) ||
      !isSrcChainSupported ||
      !isDstChainSupported
    )
      throw Error("Swap not supported");

    const wallet = getWallet(pkOrProvider, swapRequest.srcChainId, isGasless);
    let fromAmountInUnits: string;

    if (swapRequest.srcChainTokenIn !== AddressZero) {
      // Approve token
      const contract: ERC20 = ERC20__factory.connect(
        AddressZero,
        getChainProvider(swapRequest.srcChainId)
      ).attach(swapRequest.srcChainTokenIn);
      const decimals = await contract.decimals();

      fromAmountInUnits = parseUnits(
        swapRequest.srcChainTokenInAmount,
        decimals
      ).toString();

      await this.approveToken(contract, fromAmountInUnits, wallet);
    } else {
      fromAmountInUnits = parseEther(
        swapRequest.srcChainTokenInAmount
      ).toString();
    }

    if (swapRequest.srcChainId === swapRequest.dstChainId)
      return this.singleChainSwap(swapRequest, fromAmountInUnits!, wallet);
    return this.crossChainSwap(swapRequest, fromAmountInUnits!, wallet);
  }

  public static async getQuote(quoteRequest: QuoteRequest) {
    // Validation
    const isSrcChainSupported = !!this.config.chains[quoteRequest.srcChainId];
    const isDstChainSupported = !!this.config.chains[quoteRequest.srcChainId];
    if (
      new BigNumber(quoteRequest.srcChainTokenInAmount).lte(0) ||
      !isSrcChainSupported ||
      !isDstChainSupported
    )
      throw Error("Swap not supported");

    let fromAmountInUnits: string;
    let dstTokenDecimals: number;

    if (quoteRequest.srcChainTokenIn !== AddressZero) {
      const contract: ERC20 = ERC20__factory.connect(
        AddressZero,
        getChainProvider(quoteRequest.srcChainId)
      ).attach(quoteRequest.srcChainTokenIn);
      const decimals = await contract.decimals();

      fromAmountInUnits = parseUnits(
        quoteRequest.srcChainTokenInAmount,
        decimals
      ).toString();
    } else {
      fromAmountInUnits = parseEther(
        quoteRequest.srcChainTokenInAmount
      ).toString();
    }

    if (quoteRequest.dstChainTokenOut !== AddressZero) {
      const contract: ERC20 = ERC20__factory.connect(
        AddressZero,
        getChainProvider(quoteRequest.dstChainId)
      ).attach(quoteRequest.dstChainTokenOut);
      dstTokenDecimals = await contract.decimals();
    } else {
      dstTokenDecimals = 18;
    }



    if (quoteRequest.srcChainId === quoteRequest.dstChainId)
      return this.singleChainSwapQuote(quoteRequest, fromAmountInUnits!, dstTokenDecimals!);
    return this.crossChainSwapQuote(quoteRequest, fromAmountInUnits!, dstTokenDecimals!);
  }


  private static async singleChainSwapQuote(
    quoteRequest: QuoteRequest,
    fromAmountInUnits: string,
    decimals: number
  ) {
    const {
      srcChainId: chainId,
      srcChainTokenIn: tokenIn,
      dstChainTokenOut: tokenOut,
    } = quoteRequest;

    const response = await fetchGet(this.config.url + "chain/estimation", {
      chainId,
      tokenIn,
      tokenInAmount: fromAmountInUnits,
      tokenOut,
    });

    if (!response.estimation) throw Error('Could not get quote');
    return {
      amount: formatUnits(response.estimation.tokenOut.amount, decimals),
      minAmount: formatUnits(response.estimation.tokenOut.minAmount, decimals),
    }
  }

  private static async singleChainSwap(
    swapRequest: SwapRequest,
    fromAmountInUnits: string,
    wallet: Wallet | JsonRpcSigner
  ) {
    const {
      srcChainId: chainId,
      srcChainTokenIn: tokenIn,
      srcChainTokenInAmount: tokenInAmount,
      dstChainTokenOut: tokenOut,
      dstChainTokenOutRecipient: tokenOutRecipient,
    } = swapRequest;

    const response = await fetchGet(this.config.url + "chain/transaction", {
      chainId,
      tokenIn,
      tokenInAmount: fromAmountInUnits,
      tokenOut,
      tokenOutRecipient,
    });

    if (!response.tx) throw Error("Swap Tx Could not be created...Try again perhaps with different params");

    const preparedTx = await TransactionService.prepareTransaction(
      {
        from: await wallet.getAddress(),
        ...response.tx,
        value: EthersBigNumber.from(response.tx.value)
      },
      chainId
    );

    const swapTx = await wallet.sendTransaction(preparedTx);

    return swapTx.hash;
  }


  private static async crossChainSwapQuote(
    quoteRequest: QuoteRequest,
    fromAmountInUnits: string,
    decimals: number,
  ) {
    const {
      srcChainId,
      srcChainTokenIn,
      dstChainId,
      dstChainTokenOut,
    } = quoteRequest;
    const response = await fetchGet(this.config.url + "estimation", {
      srcChainId,
      srcChainTokenIn,
      srcChainTokenInAmount: fromAmountInUnits,
      dstChainId,
      dstChainTokenOut,
    });

    if (!response.estimation) throw Error('Could not get quote');

    return {
      amount: formatUnits(response.estimation.dstChainTokenOut.amount, decimals),
      minAmount: formatUnits(response.estimation.dstChainTokenOut.minAmount, decimals)
    };
  }

  private static async crossChainSwap(
    swapRequest: SwapRequest,
    fromAmountInUnits: string,
    wallet: Wallet | JsonRpcSigner
  ) {
    const {
      srcChainId,
      srcChainTokenIn,
      dstChainId,
      dstChainTokenOut,
      dstChainTokenOutRecipient,
    } = swapRequest;
    const response = await fetchGet(this.config.url + "transaction", {
      srcChainId,
      srcChainTokenIn,
      srcChainTokenInAmount: fromAmountInUnits,
      dstChainId,
      dstChainTokenOut,
      dstChainTokenOutRecipient,
    });

    if (!response.tx) throw Error("Swap Tx Could not be created...Try again perhaps with different params");

    const preparedTx = await TransactionService.prepareTransaction(
      {
        from: await wallet.getAddress(),
        ...response.tx,
        value: EthersBigNumber.from(response.tx.value)
      },
      srcChainId
    );

    const sendTx = await wallet.sendTransaction(preparedTx);

    return sendTx.hash;

  }

  private static async approveToken(
    contract: ERC20,
    amount: string,
    wallet: Wallet  | JsonRpcSigner
  ) {
    if (await this.hasAllowance(contract, amount, await wallet.getAddress())) return true;

    const tx = await contract.populateTransaction.approve(
      this.config.routerAddress,
      amount
    );
    const preparedTx = await TransactionService.prepareTransaction(
      {
        ...tx,
        to: contract.address,
      },
      await wallet.getChainId()
    );

    const approveTx = await wallet.sendTransaction(preparedTx);
    await this.waitForApproveConfirmations(approveTx.hash, wallet.provider);
    return true;
  }

  private static async hasAllowance(
    contract: ERC20,
    amount: string,
    fromAddress: string
  ): Promise<boolean> {
    const allowance = await contract.allowance(
      fromAddress,
      this.config.routerAddress
    );
    return allowance.gte(amount);
  }

  private static async waitForApproveConfirmations(
    approveTxHash: string,
    chainProvider: ethers.providers.Provider
  ) {
    return withInterval(async () => {
      try {
        const tx = await chainProvider.getTransaction(approveTxHash);
        if (tx && tx.confirmations && tx.confirmations > 0) {
          return {
            status: "SUCCESS",
          };
        }
      } catch (e) {
        throw Error(`Problem Confirming approval Tx, ${e}`);
      }
    });
  }

  public static async getSwapStatus(statusRequest: SwapStatusRequest) {
    if (statusRequest.srcChainId === statusRequest.dstChainId)
      return this.getSingleChainSwapStatus(statusRequest.txHash, statusRequest.srcChainId);
    return this.getCrossChainSwapStatus(statusRequest.txHash, statusRequest.srcChainId, statusRequest.dstChainId);
  }

  private static async getSingleChainSwapStatus(
    swapTxHash: string,
    chainId: number
  ): Promise<string> {

    return TransactionService.getTransactionStatus(swapTxHash, chainId, this.config.chains[chainId].minBlockConfirmation);
  }

  private static async getCrossChainSwapStatus(
    sendTxHash: string,
    srcChainId: number,
    dstChainId: number,
  ) {
    const sendStatus = await TransactionService.getTransactionStatus(sendTxHash, srcChainId);
    let receiveStatus;
    if (sendStatus === TX_STATUS.SUCCESS) {
      const signatureVerifier = new ethers.Contract(
        this.config.chains[srcChainId].signatureVerifier,
        SignatureVerifier.abi,
        getChainProvider(srcChainId)
      );
      const minConfirmations = await signatureVerifier.minConfirmations();
      const count = await this.getConfirmationsCount(sendTxHash);
      if (count >= minConfirmations) {
        receiveStatus = await this.getCrossChainSwapReceiveStatus(sendTxHash, dstChainId);
      }

      return { sendStatus, receiveStatus };
    }

    return { sendStatus, receiveStatus: null };
  }

  private static async getCrossChainSwapReceiveStatus(sendTxHash: string, dstChainId: number) {
    const submissionInfo = await this.getFullSubmissionInfo(sendTxHash);

    if (submissionInfo?.send?.isExecuted && submissionInfo?.claim) {
      return TransactionService.getTransactionStatus(submissionInfo?.claim.transactionHash, dstChainId);
    }

    return TX_STATUS.NOT_FOUND;
  }

  private static async getConfirmationsCount(
    swapTxHash: string
  ): Promise<number> {
    try {
      const submissionId = await this.getSubmissionId(swapTxHash);
      if (submissionId) {
        const result = await fetchGet(this.config.api + "SubmissionConfirmations/getForSubmission", {
          submissionId: submissionId,
        });
        if (Array.isArray(result)) {
          return result.length;
        }
      }
    } catch (e) { }
    return 0;
  }

  private static async getSubmissionId(
    swapTxHash: string
  ): Promise<string | null> {
    try {
      const result = await fetchGet(this.config.api + "Transactions/GetFullSubmissionInfo", {
        filter: swapTxHash,
        filterType: 1,
      });
      return result?.send?.submissionId || null;
    } catch (e) {
      return null;
    }
  }

  private static async getFullSubmissionInfo(
    swapTxHash: string
  ): Promise<FullSubmissionInfo | null> {
    try {
      const result = await fetchGet(this.config.api + "Transactions/GetFullSubmissionInfo", {
        filter: swapTxHash,
        filterType: 1,
      });
      return result || null;
    } catch (e) {
      return null;
    }
  }
}
