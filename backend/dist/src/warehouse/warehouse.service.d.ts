import { PrismaService } from "../prisma/prisma.service";
export declare class WarehouseService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listMyWarehouseInventory(profileId: number): Promise<{
        batchId: string;
        batchName: string;
        image: string | null;
        quantity: number;
        mintedAt: Date;
        policyId: string | null;
        status: string;
    }[]>;
    removeOneFromWarehouse(profileId: number, batchId: string): Promise<void>;
    markAsShipped(profileId: number, batchId: string): Promise<void>;
    addToWarehouse(profileId: number, batchId: string): Promise<void>;
    getRecipientByRoadmap(profileId: number, batchId: string): Promise<{
        recipientAddress: string | null;
    }>;
}
