import type { UTxO } from "@meshsdk/core";
import { OrderContract } from "./order.contract";
import { ProductService } from "../product/product.service";
import { OrderRepositoryPort } from "./domain/order.repository";
import { ListOrdersForProfileUseCase } from "./application/use-cases/list-orders-for-profile.use-case";
import { SavePartialSignedTxUseCase } from "./application/use-cases/save-partial-signed-tx.use-case";
import { RecordOrderUseCase } from "./application/use-cases/record-order.use-case";
import { ConfirmOrderCompleteUseCase } from "./application/use-cases/confirm-order-complete.use-case";
export declare class OrderService {
    private readonly orderRepository;
    private readonly product;
    private readonly listOrdersForProfileUseCase;
    private readonly savePartialSignedTxUseCase;
    private readonly recordOrderUseCase;
    private readonly confirmOrderCompleteUseCase;
    private _contract;
    constructor(orderRepository: OrderRepositoryPort, product: ProductService, listOrdersForProfileUseCase: ListOrdersForProfileUseCase, savePartialSignedTxUseCase: SavePartialSignedTxUseCase, recordOrderUseCase: RecordOrderUseCase, confirmOrderCompleteUseCase: ConfirmOrderCompleteUseCase);
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
