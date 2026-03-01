import type { UTxO } from "@meshsdk/core";
import { OrderContract } from "./order.contract";
import { PrismaService } from "../prisma/prisma.service";
import { ProductService } from "../product/product.service";
export declare class OrderService {
    private readonly prisma;
    private readonly product;
    private _contract;
    constructor(prisma: PrismaService, product: ProductService);
    getContract(): OrderContract;
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
    listOrdersForProfile(profileId: number): Promise<{
        id: number;
        lockTxHash: string;
        scriptOutputIndex: number;
        batchId: string;
        policyId: string | null;
        recipientAddress: string;
        senderAddress: string;
        ownerAddresses: string[];
        status: string;
        partialSignedTxHex: string | null;
        partialSignedByAddress: string | null;
        secondSignedByAddress: string | null;
        unlockTxHash: string | null;
    }[]>;
    savePartialSignedTx(deliveryId: number, profileId: number, partialTxHex: string): Promise<{
        ok: boolean;
    }>;
    recordOrder(params: {
        lockTxHash: string;
        scriptOutputIndex?: number;
        batchId: string;
        policyId?: string;
        recipientAddress: string;
        senderAddress: string;
        ownerAddresses: string[];
    }): Promise<{
        id: number;
    }>;
    confirmOrderComplete(params: {
        unlockTxHash: string;
        witnessCount: number;
        signedByAddress?: string;
        deliveryId?: number;
    }): Promise<{
        ok: boolean;
        recipientAddress?: string;
    }>;
}
