import { PrismaService } from '../prisma/prisma.service';
export declare class WarehouseService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(createdBy: string): Promise<any>;
    create(createdBy: string, data: any): Promise<any>;
    update(createdBy: string, idRaw: unknown, data: any): Promise<any>;
    remove(createdBy: string, idRaw: unknown): Promise<{
        id: string;
    }>;
}
