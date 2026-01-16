import { MeshTxBuilder, MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import type { UTxO, PlutusScript, IFetcher } from '@meshsdk/core';
import type { Plutus } from './types';
export declare class MeshAdapter {
    protected meshTxBuilder: MeshTxBuilder;
    protected wallet: MeshWallet;
    protected fetcher: IFetcher;
    protected blockfrostProvider: BlockfrostProvider;
    protected pubKeyExchange?: string;
    protected pubKeyIssuer?: string;
    protected mintCompileCode?: string;
    protected storeCompileCode?: string;
    protected storeScriptCbor?: string;
    protected storeScript?: PlutusScript;
    storeAddress?: string;
    protected storeScriptHash?: string;
    protected mintScriptCbor?: string;
    protected mintScript?: PlutusScript;
    policyId?: string;
    private initialized;
    constructor(wallet?: MeshWallet);
    protected createMeshTxBuilder(): MeshTxBuilder;
    init(): Promise<void>;
    protected getWalletForTx(): Promise<{
        utxos: UTxO[];
        collateral: UTxO;
        walletAddress: string;
    }>;
    protected readValidator(plutus: Plutus, title: string): string;
    protected getAddressUTXOAsset(address: string, unit: string): Promise<UTxO>;
    protected getAddressUTXOAssets(address: string, unit: string): Promise<UTxO[]>;
    signAndSubmit(unsignedTx: string): Promise<string>;
    waitForConfirmation(txHash: string): Promise<void>;
}
