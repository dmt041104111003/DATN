import { PrismaService } from "../../prisma/prisma.service";
import { MintBatchParams, ProductBatchListItem, ProductBatchSnapshot, ProductRepositoryPort, UpdateBatchParams, ProductRoadmapHop } from "../domain/product.repository";
export declare class PrismaProductRepository implements ProductRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBatchesByMinter(profileId: number): Promise<ProductBatchListItem[]>;
    upsertBatchOnMint(params: MintBatchParams): Promise<void>;
    findBatchByCode(code: string): Promise<ProductBatchSnapshot | null>;
    updateBatch(params: UpdateBatchParams): Promise<void>;
    markBatchRevoked(code: string, nextMetadata: object): Promise<void>;
    markBatchBurned(code: string, nextMetadata: object): Promise<void>;
    createRoadmaps(batchId: string, action: "MINT" | "UPDATE" | "REVOKE", receivers: string[], txHash: string): Promise<void>;
    listRoadmap(batchId: string): Promise<ProductRoadmapHop[]>;
}
