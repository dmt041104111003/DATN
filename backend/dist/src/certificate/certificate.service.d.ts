import { PrismaService } from "../prisma/prisma.service";
export declare class CertificateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(issuerProfileId: number, options?: {
        batchId?: string;
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        total: number;
        items: {
            id: number;
            title: string;
            imageUrl: string | null;
            issuedAt: Date;
            batchId: string;
            batchName: string;
            productBatchCode: string;
            productBatchName: string | null;
            metadata: unknown;
        }[];
    }>;
    getById(id: number, issuerProfileId: number): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
        issuedAt: Date;
        metadata: unknown;
        batchId: string;
        batchName: string;
        productBatchCode: string;
        productBatchName: string | null;
    }>;
    create(issuerProfileId: number, data: {
        title: string;
        batchId: string;
        imageUrl: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
}
