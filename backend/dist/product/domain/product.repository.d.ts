export interface ProductBatchListItem {
    id: number;
    batchId: string;
    name: string;
    description: string | null;
    image: string | null;
    createdAt: Date;
    policyId: string | null;
}
export interface ProductBatchSnapshot {
    batchId: string;
    name: string;
    description: string | null;
    image: string | null;
    standard: string | null;
    policyId: string | null;
    expiryDate: Date | null;
    sku: string | null;
    gtin: string | null;
    hsCode: string | null;
    productCategory: string | null;
    grossWeightKg: number | null;
    netWeightKg: number | null;
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
    storageCondition: string | null;
    originSiteCode: string | null;
    referenceUtxo: string | null;
    lastUpdateTxHash: string | null;
    lastUpdateAt: Date | null;
    revokeTxHash: string | null;
    revokedAt: Date | null;
    revoked: boolean;
    burnTxHash: string | null;
    burnedAt: Date | null;
    burned: boolean;
}
export interface ProductRoadmapHop {
    stepIndex: number;
    fromAddress: string | null;
    toAddress: string | null;
}
export interface MintBatchParams {
    batchId: string;
    name: string;
    description: string | null;
    image: string | null;
    standard: string;
    mintTxHash: string;
    policyId?: string;
    minterProfileId: number;
    expiryDate?: Date | string | null;
    sku?: string | null;
    gtin?: string | null;
    hsCode?: string | null;
    productCategory?: string | null;
    grossWeightKg?: number | null;
    netWeightKg?: number | null;
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
    storageCondition?: string | null;
    originSiteCode?: string | null;
    referenceUtxo?: string | null;
}
export interface UpdateBatchParams {
    batchId: string;
    name?: string;
    description?: string | null;
    image?: string | null;
    standard?: string | null;
    expiryDate?: Date | string | null;
    lastUpdateTxHash?: string | null;
    lastUpdateAt?: Date | string | null;
    sku?: string | null;
    gtin?: string | null;
    hsCode?: string | null;
    productCategory?: string | null;
    grossWeightKg?: number | null;
    netWeightKg?: number | null;
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
    storageCondition?: string | null;
    originSiteCode?: string | null;
    referenceUtxo?: string | null;
}
export interface ProductRepositoryPort {
    listBatchesByMinter(profileId: number): Promise<ProductBatchListItem[]>;
    upsertBatchOnMint(params: MintBatchParams): Promise<void>;
    findBatchByCode(batchId: string): Promise<ProductBatchSnapshot | null>;
    getMinterWalletAddressByBatchCode(batchId: string): Promise<string | null>;
    updateBatch(params: UpdateBatchParams): Promise<void>;
    markBatchRevoked(batchId: string): Promise<void>;
    markBatchBurned(batchId: string, burnTxHash: string): Promise<void>;
    createRoadmaps(batchId: string, action: "MINT" | "UPDATE" | "REVOKE", fromAddress: string, receivers: string[], txHash: string): Promise<void>;
    listRoadmap(batchId: string): Promise<ProductRoadmapHop[]>;
}
export declare const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";
