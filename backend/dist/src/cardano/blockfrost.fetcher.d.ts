import type { Asset } from "@meshsdk/core";
import type { Transaction, UtXO } from "../types";
export type BlockfrostFetcherDeps = {
    buildRef100Unit: (policyId: string, assetName: string) => string;
    parseHttpError: (error: unknown) => string;
};
export declare class BlockfrostFetcher {
    private readonly _axiosInstance;
    private readonly _network;
    private readonly _buildRef100Unit;
    private readonly _parseHttpError;
    constructor(projectIdOrBaseUrl: string, version?: number, deps?: BlockfrostFetcherDeps);
    private _get;
    fetchAddressDetail(address: string): Promise<unknown>;
    fetchSpecificAsset(asset: string): Promise<unknown>;
    isAssetRevoked(policyId: string, assetName: string): Promise<boolean>;
    fetchAssetTransactions(asset: string): Promise<unknown>;
    fetchAllAssetTransactions(asset: string): Promise<Array<{
        tx_hash: string;
    }>>;
    fetchAssetsByPolicy(policyId: string): Promise<Array<{
        asset: string;
        quantity: string;
    }>>;
    fetchAssetsByAddress(address: string): Promise<Asset[]>;
    fetchUtxoByAddress(address: string): Promise<Array<UtXO>>;
    fetchTransactionsUTxO(txHash: string): Promise<Transaction>;
    fetchDatum(datum: string): Promise<unknown>;
    fetchSpecialTransaction(txHash: string): Promise<unknown>;
    fetchAddressUTXOsAsset(address: string, asset: string): Promise<unknown>;
    fetchSpecialAddress(address: string): Promise<unknown>;
    fetchAccountAssociate(stakeAddress: string): Promise<unknown>;
    fetchDetailsAccount(stakeAddress: string): Promise<unknown>;
}
