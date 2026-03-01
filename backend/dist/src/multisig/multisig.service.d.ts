import type { UTxO } from "@meshsdk/core";
import { MultisigContract } from "./multisig.contract";
export declare class MultisigService {
    private _contract;
    getContract(): MultisigContract;
    getScriptAddress(): string;
    getScriptCbor(): string;
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
        utxos: UTxO[] | unknown[];
    }): Promise<string>;
    buildUnlockTx(params: {
        scriptUtxo: UTxO | unknown;
        outputAddress: string;
        signingOwnersPkh: string[];
        threshold: number;
        collateral: UTxO | unknown;
        changeAddress: string;
        utxos: UTxO[] | unknown[];
    }): Promise<string>;
    parseDatumFromUtxo(utxo: UTxO | unknown): Promise<{
        ownersPkh: string[];
        threshold: number;
        recipientPkh: string;
        recipientAddress: string;
        ownerAddresses: string[];
    }>;
    getScriptUtxos(scriptAddress?: string): Promise<UTxO[]>;
    getScriptUtxoByAsset(policyId: string, assetName: string, scriptAddress?: string): Promise<UTxO | null>;
    mergePartialTx(partialTxHex: string, secondSignerResultHex: string): {
        mergedTxHex: string;
        witnessCount: number;
        requiredSigners: string[];
    };
    inspectTx(txHex: string): {
        requiredSigners: string[];
        witnessCount: number;
    };
}
