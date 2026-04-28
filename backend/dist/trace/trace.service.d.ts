import { PrismaService } from '../prisma/prisma.service';
export interface TraceResult {
    lotPassport: Record<string, unknown>;
    productionMetadata?: Record<string, unknown> | null;
    points?: Array<{
        name: string;
        walletAddress: string;
        location: string;
    }>;
    latestSignerWallet?: string | null;
    message?: string;
}
type TraceHistoryItem = {
    source: 'PRODUCTION' | 'CONTAINER';
    txHash: string;
    time: string;
    metadata: Record<string, unknown> | null;
};
export interface TraceHistoryResult {
    items: TraceHistoryItem[];
    total: number;
    page: number;
    limit: number;
}
export declare class TraceService {
    private readonly prisma;
    private blockfrost;
    private parseParticipantWallets;
    private parseParticipantLocations;
    private extractLatestSignerWallet;
    private extractProductionInventoryKeyHex;
    private parseProductionRefInline;
    private encodeRefUnit;
    private readLatestMetadataByUnit;
    private listAssetTxHashes;
    private readMetadataByTxHashAndUnit;
    private buildHistory;
    private resolveHistoryUnits;
    constructor(prisma: PrismaService);
    private buildPointDetails;
    private resolveBlockfrostAssetUnit;
    private readLatestPassport;
    getProductTrace(inventoryKey: string): Promise<TraceResult>;
    getTraceHistory(inventoryKey: string, pageRaw: number, limitRaw: number): Promise<TraceHistoryResult>;
}
export {};
