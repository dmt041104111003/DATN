import { MultisigService } from "./multisig.service";
import { AuthService } from "../auth/auth.service";
import { BuildLockTxDto, BuildUnlockTxDto, ParseDatumDto, MergePartialTxDto, LockConfirmDto, UnlockConfirmDto, SavePartialTxDto } from "./dto/multisig.dto";
export declare class MultisigController {
    private readonly multisig;
    private readonly auth;
    constructor(multisig: MultisigService, auth: AuthService);
    getScriptAddress(): {
        scriptAddress: string;
    };
    getLockDeliveries(token?: string): Promise<{
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
        }[];
    }>;
    savePartialTx(id: string, token: string | undefined, body: SavePartialTxDto): Promise<{
        ok: boolean;
    }>;
    getScriptUtxos(scriptAddress?: string): Promise<{
        utxos: unknown[];
    }>;
    getScriptUtxoByAsset(policyId?: string, assetName?: string, scriptAddress?: string): Promise<{
        utxo: unknown | null;
    }>;
    buildLockTx(body: BuildLockTxDto): Promise<{
        unsignedTx: string;
        scriptAddress: string;
    }>;
    parseDatum(body: ParseDatumDto): Promise<{
        ownersPkh: string[];
        threshold: number;
        recipientPkh: string;
        recipientAddress: string;
        ownerAddresses: string[];
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
    lockConfirm(body: LockConfirmDto): Promise<{
        id: number;
    }>;
    unlockConfirm(body: UnlockConfirmDto): Promise<{
        ok: boolean;
        recipientAddress?: string;
    }>;
}
