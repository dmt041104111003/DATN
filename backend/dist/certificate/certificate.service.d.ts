import { CertificateRepositoryPort } from "./domain/certificate.repository";
import { ListCertificatesUseCase } from "./application/use-cases/list-certificates.use-case";
import { GetCertificateByIdUseCase } from "./application/use-cases/get-certificate-by-id.use-case";
import { CreateCertificateUseCase } from "./application/use-cases/create-certificate.use-case";
export declare class CertificateService {
    private readonly repository;
    private readonly listCertificatesUseCase;
    private readonly getCertificateByIdUseCase;
    private readonly createCertificateUseCase;
    constructor(repository: CertificateRepositoryPort, listCertificatesUseCase: ListCertificatesUseCase, getCertificateByIdUseCase: GetCertificateByIdUseCase, createCertificateUseCase: CreateCertificateUseCase);
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
