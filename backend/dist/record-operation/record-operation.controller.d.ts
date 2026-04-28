import { PrismaService } from '../prisma/prisma.service';
export declare class RecordOperationController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getCustodian;
    list(req: any, entityTypeParam: string, entityKeyParam: string): Promise<any[]>;
}
