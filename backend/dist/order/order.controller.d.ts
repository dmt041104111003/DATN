import { OrderService } from "./order.service";
import { AuthService } from "../auth/auth.service";
import { BuildLockTxDto, BuildUnlockTxDto, ParseDatumDto, MergePartialTxDto, OrderConfirmDto, OrderCompleteDto, SavePartialTxDto } from "./dto/order.dto";
export declare class OrderController {
    private readonly order;
    private readonly auth;
    constructor(order: OrderService, auth: AuthService);
    getScriptAddress(): {
        scriptAddress: string;
    };
    getScriptUtxos(scriptAddress?: string): Promise<{
        utxos: unknown[];
    }>;
    getScriptUtxoByAsset(policyId?: string, assetName?: string, scriptAddress?: string): Promise<{
        utxo: unknown | null;
    }>;
    parseDatum(body: ParseDatumDto): Promise<{
        ownersPkh: string[];
        threshold: number;
        recipientPkh: string;
        recipientAddress: string;
        ownerAddresses: string[];
    }>;
    buildLockTx(body: BuildLockTxDto): Promise<{
        unsignedTx: string;
        scriptAddress: string;
    }>;
    confirmOrder(body: OrderConfirmDto): Promise<{
        id: number;
    }>;
    getDeliveries(token?: string): Promise<{
        deliveries: {
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
            outAt: string | null;
        }[];
    }>;
    savePartialTx(id: string, token: string | undefined, body: SavePartialTxDto): Promise<{
        ok: boolean;
    }>;
    buildUnlockTx(body: BuildUnlockTxDto): Promise<{
        unsignedTx: string;
    }>;
    mergePartialTx(body: MergePartialTxDto): {
        mergedTxHex: string;
        witnessCount: number;
        requiredSigners: string[];
    };
    inspectTx(txHex?: string): {
        requiredSigners: string[];
        witnessCount: number;
    };
    completeOrder(body: OrderCompleteDto): Promise<{
        ok: boolean;
        recipientAddress?: string;
    }>;
}
