import type { PolicyAssetRow, BuildMetadataInput } from "./trace.service";
import { TraceService } from "./trace.service";
export declare class TraceController {
    private readonly trace;
    constructor(trace: TraceService);
    listByPolicy(policyId: string): Promise<{
        policyId: string;
        total: number;
        assets: PolicyAssetRow[];
    }>;
    buildMetadata(body: BuildMetadataInput): Record<string, string>;
    mint(body: {
        changeAddress: string;
        assetName: string;
        metadata: Record<string, string>;
        receiver?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    update(body: {
        changeAddress: string;
        assetName: string;
        metadata: Record<string, string>;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    burn(body: {
        changeAddress: string;
        assetName: string;
        quantity?: string;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    revoke(body: {
        changeAddress: string;
        assetName: string;
        txHash?: string;
    }): Promise<{
        unsignedTx: string;
    }>;
    submit(body: {
        signedTx: string;
    }): Promise<{
        txHash: string;
    }>;
}
