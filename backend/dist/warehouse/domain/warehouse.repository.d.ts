export interface WarehouseInventoryItem {
    batchId: string;
    batchName: string;
    image: string | null;
    receivedAt: Date;
    policyId: string | null;
    status: string;
}
export interface RecipientByRoadmapResult {
    recipientAddress: string | null;
}
export interface WarehouseRepositoryPort {
    listInventoryByProfileId(profileId: number): Promise<WarehouseInventoryItem[]>;
    removeInventoryForProfile(profileId: number, batchId: string): Promise<void>;
    markAsShippedForProfile(profileId: number, batchId: string): Promise<void>;
    markAsBurnedForProfile(profileId: number, batchId: string, burnTxHash?: string): Promise<void>;
    addToWarehouseForProfile(profileId: number, batchId: string): Promise<void>;
    findRecipientByRoadmap(profileId: number, batchId: string): Promise<RecipientByRoadmapResult>;
}
export declare const WAREHOUSE_REPOSITORY = "WAREHOUSE_REPOSITORY";
