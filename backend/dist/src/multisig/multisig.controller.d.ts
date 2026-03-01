import { MultisigService } from "./multisig.service";
import { BuildLockTxDto, BuildUnlockTxDto, ParseDatumDto, MergePartialTxDto } from "./dto/multisig.dto";
export declare class MultisigController {
    private readonly multisig;
    constructor(multisig: MultisigService);
    getScriptAddress(): {
        scriptAddress: string;
    };
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
}
