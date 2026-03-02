import type { MeshWallet } from "@meshsdk/core";
import { MeshAdapter, type MeshAdapterDeps } from "./mesh.adapter";
export type Cip68ContractOpts = {
    wallet?: MeshWallet;
    minterMintScriptCbor?: string;
} & MeshAdapterDeps;
export declare class Cip68Contract extends MeshAdapter {
    constructor(opts?: Cip68ContractOpts);
    private get appNetwork();
    mint: (params: {
        assetName: string;
        metadata: Record<string, string>;
        quantity: string;
        receiver: string;
    }[]) => Promise<string>;
    burn: (params: {
        assetName: string;
        quantity: string;
        txHash?: string;
        policyId?: string;
    }[]) => Promise<string>;
    update: (params: {
        assetName: string;
        metadata: Record<string, string>;
        txHash?: string;
    }[]) => Promise<string>;
    revoke: (params: {
        assetName: string;
        txHash?: string;
    }[]) => Promise<string>;
    createReferenceScriptMint: (MINT_REFERENCE_SCRIPT_ADDRESS: string) => Promise<string>;
    createReferenceScriptStore: (STORE_REFERENCE_SCRIPT_ADDRESS: string) => Promise<string>;
    getRftSupply: (assetName: string, policyId?: string) => Promise<string>;
    getRftBalanceAtAddress: (address: string, assetName: string, policyId?: string) => Promise<number>;
    getRftDistribution: (assetName: string, inChainAddresses: string[], policyId?: string) => Promise<{
        inChain: Map<string, number>;
        offChain: Map<string, number>;
        totalInChain: number;
        totalOffChain: number;
        totalSupply: string;
    }>;
}
