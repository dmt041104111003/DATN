import { BlockfrostProvider, type UTxO } from '@meshsdk/core';
import { PlutusHelper } from './plutus.helper';
export declare class TxBuilderHelper {
    private blockfrostProvider;
    private plutusHelper;
    private readonly appNetworkId;
    constructor(blockfrostProvider: BlockfrostProvider, plutusHelper: PlutusHelper);
    private newTxBuilder;
    getUtxosForAddress(address: string): Promise<UTxO[]>;
    getCollateralForAddress(address: string): Promise<UTxO[]>;
    getAddressUTXOAsset(address: string, unit: string): Promise<UTxO | null>;
    buildMintTx(walletAddress: string, owners: string[], products: Array<{
        productName: string;
        metadata: Record<string, string>;
        quantity?: string;
        receiver?: string;
    }>): Promise<string>;
    buildUpdateTx(walletAddress: string, owners: string[], products: Array<{
        productName: string;
        metadata: Record<string, string>;
    }>): Promise<string>;
    buildBurnTx(walletAddress: string, owners: string[], products: Array<{
        productName: string;
    }>): Promise<string>;
}
