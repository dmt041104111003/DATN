import type { UTxO } from "@meshsdk/core";
import type { MultisigContractOpts, MultisigDatum } from "./multisig.types";
export declare class MultisigContract {
    private plutus;
    private appNetwork;
    private validatorTitle;
    private _scriptCbor;
    private _scriptAddress;
    constructor(opts?: MultisigContractOpts);
    private getValidator;
    getScriptCbor(): string;
    getScriptAddress(): string;
    buildDatum(d: MultisigDatum): {
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
    parseDatumFromUtxo(utxo: UTxO): Promise<MultisigDatum>;
}
