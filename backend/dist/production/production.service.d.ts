import { PrismaService } from '../prisma/prisma.service';
export declare class ProductionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private certToString;
    private attachMediaBatch;
    private composeResponse;
    private getMediaByKey;
    list(): Promise<any>;
    create(createdBy: string, data: any): Promise<any>;
    update(createdBy: string, inventoryKey: string, data: any): Promise<any>;
    deleteByInventoryKey(inventoryKeyRaw: unknown, txHashRaw: unknown): Promise<{
        inventoryKey: string;
        pendingDelete: boolean;
    }>;
}
