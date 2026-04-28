import { PrismaService } from '../prisma/prisma.service';
export declare class WarehouseStorageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private writeOperation;
    list(createdBy: string): Promise<any>;
    create(createdBy: string, data: any): Promise<any>;
    update(createdBy: string, idRaw: unknown, data: any): Promise<any>;
    remove(createdBy: string, roleRaw: unknown, idRaw: unknown, data?: any): Promise<{
        id: string;
        deleted: boolean;
        txHash: string;
    }>;
}
