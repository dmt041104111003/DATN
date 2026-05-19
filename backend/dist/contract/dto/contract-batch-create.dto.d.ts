export declare class ContractBatchCreateItemDto {
    assetName: string;
    metadata: Record<string, string>;
}
export declare class ContractBatchCreateDto {
    owners: string[];
    items: ContractBatchCreateItemDto[];
    assetName?: string;
    metadata?: Record<string, string>;
}
