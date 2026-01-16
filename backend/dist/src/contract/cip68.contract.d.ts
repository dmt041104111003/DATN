import { MeshWallet } from '@meshsdk/core';
export declare class Cip68Contract {
    private meshTxBuilder;
    private wallet;
    private fetcher;
    private blockfrostProvider;
    private pubKeyExchange;
    private pubKeyIssuer;
    private storeScriptCbor;
    private mintScriptCbor;
    storeAddress: string;
    policyId: string;
    constructor({ wallet }: {
        wallet: MeshWallet;
    });
    private readValidator;
    private getWalletForTx;
    private getAddressUTXOAsset;
    payment({ amount }: {
        amount: string;
    }): Promise<string>;
    mint(params: {
        assetName: string;
        metadata: Record<string, string>;
        quantity: string;
        receiver: string;
    }[]): Promise<string>;
    burn(params: {
        assetName: string;
        quantity: string;
    }[]): Promise<string>;
    update(params: {
        assetName: string;
        metadata: Record<string, string>;
    }[]): Promise<string>;
}
