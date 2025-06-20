import { networks } from "./config";
import { Address, formatUnits, Provider, bn, BN, Wallet} from "fuels"
import { GetTransactionResult, SendTransactionParams, SendTransactionResult, getFeeStatsResult } from "./types"
import { FEE_MULTIPLIERS, GAS_USED, TX_SIZE_BYTES } from "./constants";

/**
 * Get the network config
 * @param network
 * @returns network config
 */
export const getNetwork = (network: string) => (network === 'main' ? networks[network] : networks.testnet);

/**
 *
 * @param txId
 * @param network
 * @returns transaction link
 */
export const getTransactionLink = (txId: string, network: string) => getNetwork(network).transactionLink(txId);

/**
 * get wallet link for the given address
 * @param walletAddress
 * @param network
 * @returns wallet link
 */
export const getWalletLink = (walletAddress: string, network: string) => getNetwork(network).walletLink(walletAddress);

const getProvider = async (network: string) => {
    const networkConfig = getNetwork(network);
    const NETWORK_URL = networkConfig.networkUrl;
    const provider = new Provider(NETWORK_URL)
    return provider;
}


export const getTransaction = async (txId: string, network: string): Promise<GetTransactionResult | null> => {
    const provider = await getProvider(network);

    const transaction = await provider.getTransaction(txId);
    if (!transaction) {
        return null;
    }
    const receipts = await provider.getTransactionResponse(txId);
    if (!receipts) {
        return null;
    }
    const transactionWithReceipts = await receipts.provider.operations.getTransactionWithReceipts({
        transactionId: txId
    });

    const isPending = false;
    const isExecuted = true;
    const isInvalid = false;

    const isSuccessful = transactionWithReceipts.transaction?.status?.type === 'SuccessStatus';
    const isFailed = transactionWithReceipts.transaction?.status?.type === 'FailureStatus';
    const totalFee = transactionWithReceipts.transaction?.status && 'totalFee' in transactionWithReceipts.transaction.status 
      ? transactionWithReceipts.transaction.status.totalFee 
      : '0';
    const totalGas = transactionWithReceipts.transaction?.status && 'totalGas' in transactionWithReceipts.transaction.status 
      ? transactionWithReceipts.transaction.status.totalGas 
      : '0';
    const formattedTotalFee = Number(formatUnits(totalFee, 9));
    return {
        transactionData: transaction,
        receipt: {
            date: new Date(),
            from: "",
            gasCostCryptoCurrency: 'ETH',
            gasCostInCrypto: formattedTotalFee,
            gasLimit: Number(totalGas),
            isPending,
            isExecuted,
            isSuccessful,
            isFailed,
            rejectReason: "",
            isInvalid,
            network,
            nonce: 0,
            transactionHash: txId,
            transactionLink: getTransactionLink(txId, network),
        }
    };
};



export const isValidWalletAddress = (walletAddress: string): boolean => {
    try {
        const address = new Address(walletAddress);
        return address !== null;
    } catch (error) {
        return false;
    }
};

export const sendTransaction = async ({
    to,
    amount,
    network,
    privateKey,
    decimals,
    tokenAddress
}: SendTransactionParams): Promise<SendTransactionResult | {}> => {
    try {
        const provider = await getProvider(network);
        const wallet = Wallet.fromPrivateKey(privateKey, provider);

        const rawAmount = bn(amount * Math.pow(10, decimals));
        const txResponse = await wallet.transfer(Address.fromB256(to), rawAmount, tokenAddress, {
            gasLimit: 1_000_000
        });
        const receipts = await txResponse.waitForResult();
        const fromAddress = wallet.address.toString();

        const result: SendTransactionResult = {
            transactionData: txResponse,
            receipt: {
                amount,
                date: new Date(),
                from: fromAddress,
                gasCostCryptoCurrency: 'ETH',
                network,
                nonce: 0,
                to,
                transactionHash: txResponse.id,
                transactionLink: getTransactionLink(txResponse.id, network),
                transactionReceipt: receipts,
                rejectReason: '',
            },
        };

        return result;
    } catch (error: any) {
        console.info(`Send transaction error: ${JSON.stringify(error)}`);

        throw error;
    }
};


export const getBalance = async (walletAddress: string, assetId: string, network: string, decimals: number) => {
    const address = new Address(walletAddress);
    const provider = await getProvider(network);
    const balance = await provider.getBalance(address, assetId);
    const formattedBalance = formatUnits(balance, decimals);
    return formattedBalance;
}


export const getFeeStats = async (network: string): Promise<getFeeStatsResult> => {
    const provider = await getProvider(network);
    const chainInfo = await provider.getChain();

    const gasPerByteBN: BN = chainInfo.consensusParameters.feeParameters.gasPerByte;
    const gasPriceFactorBN: BN = chainInfo.consensusParameters.feeParameters.gasPriceFactor;

    const gasPerByte = gasPerByteBN.toNumber();
    const gasPriceFactor = gasPriceFactorBN.toNumber();

    const baseFee = (GAS_USED * gasPriceFactor) + (TX_SIZE_BYTES * gasPerByte);
    const formattedBaseFee = Number(formatUnits(baseFee, 18));
    const estimatedLowFee = baseFee * FEE_MULTIPLIERS.low;
    const formattedEstimatedLowFee = Number(formatUnits(estimatedLowFee, 18));
    const estimatedStandardFee = baseFee * FEE_MULTIPLIERS.standard;
    const formattedEstimatedStandardFee = Number(formatUnits(estimatedStandardFee, 18));
    const estimatedFastFee = baseFee * FEE_MULTIPLIERS.fast;
    const formattedEstimatedFastFee = Number(formatUnits(estimatedFastFee, 18));
    const estimatedMaxFee = baseFee * FEE_MULTIPLIERS.max;
    const formattedEstimatedMaxFee = Number(formatUnits(estimatedMaxFee, 18));

    return {
        feeCryptoCurrency: 'ETH',
        baseFee: formattedBaseFee,
        lowFeeCharged: formattedEstimatedLowFee,
        standardFeeCharged: formattedEstimatedStandardFee,
        fastFeeCharged: formattedEstimatedFastFee,
        maxFeeCharged: formattedEstimatedMaxFee,
    };
};


export default {
    getTransactionLink,
    getWalletLink,
    getTransaction,
    isValidWalletAddress,
    sendTransaction,
    getBalance,
    getFeeStats,
};