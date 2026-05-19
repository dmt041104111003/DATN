import { PrismaService } from '../prisma/prisma.service';
export declare class ContainerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    startBatch(createdBy: string, totalBoxesRaw: unknown): Promise<any>;
    updateBatchProgress(batchIdRaw: unknown, completedBoxesRaw: unknown, statusRaw?: unknown): Promise<any>;
    private toResponse;
    private buildParticipants;
    private getLatestOp;
    private hasWarehouseStorageHistory;
    private assertContainerMutable;
    list(_createdBy: string): Promise<any>;
    create(createdBy: string, data: any): Promise<any>;
    update(createdBy: string, inventoryKey: string, data: any): Promise<any>;
    deleteByInventoryKey(_createdBy: string, _roleRaw: unknown, inventoryKeyRaw: unknown, txHashRaw: unknown): Promise<{
        inventoryKey: string;
        pendingDelete: boolean;
    }>;
}
