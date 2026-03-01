import type { UTxO } from "@meshsdk/core";
import type { Plutus } from "../types";
export type OrderDatum = {
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
};
export type OrderContractOpts = {
    plutus?: Plutus;
    appNetwork?: "mainnet" | "preprod" | "preview";
    validatorTitle?: string;
};
export declare class OrderContract {
    private plutus;
    private appNetwork;
    private validatorTitle;
    private _scriptCbor;
    private _scriptAddress;
    constructor(opts?: OrderContractOpts);
    private getValidator;
    getScriptCbor(): string;
    getScriptAddress(): string;
    getAddressFromPkh(pkhHex: string): string;
    buildDatum(d: OrderDatum): {
        alternative: number;
        fields: [string[], number, string];
    };
    buildLockTx(params: {
        scriptAddress: string;
        ownersPkh: string[];
        threshold: number;
        recipientPkh: string;
        assets: {
            unit: string;
            quantity: string;
        }[];
        changeAddress: string;
        utxos: UTxO[];
    }): Promise<string>;
    buildUnlockTx(params: {
        scriptUtxo: UTxO;
        outputAddress: string;
        signingOwnersPkh: string[];
        threshold: number;
        collateral: UTxO;
        changeAddress: string;
        utxos: UTxO[];
    }): Promise<string>;
    parseDatumFromUtxo(utxo: UTxO): Promise<OrderDatum>;
    private getAllowedPkhsFromRef100ByNftUnit;
    private assertRecipientAllowedByRef100;
}
