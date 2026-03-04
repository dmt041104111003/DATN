import { CertificateRepositoryPort, CertificateDetail, CreateCertificateData } from "./domain/certificate.repository";
import { ListCertificatesUseCase } from "./application/use-cases/list-certificates.use-case";
import { GetCertificateByIdUseCase } from "./application/use-cases/get-certificate-by-id.use-case";
import { CreateCertificateUseCase } from "./application/use-cases/create-certificate.use-case";
import { UpdateCertificateUseCase } from "./application/use-cases/update-certificate.use-case";
import { DeleteCertificateUseCase } from "./application/use-cases/delete-certificate.use-case";
export declare class CertificateService {
    private readonly repository;
    private readonly listCertificatesUseCase;
    private readonly getCertificateByIdUseCase;
    private readonly createCertificateUseCase;
    private readonly updateCertificateUseCase;
    private readonly deleteCertificateUseCase;
    constructor(repository: CertificateRepositoryPort, listCertificatesUseCase: ListCertificatesUseCase, getCertificateByIdUseCase: GetCertificateByIdUseCase, createCertificateUseCase: CreateCertificateUseCase, updateCertificateUseCase: UpdateCertificateUseCase, deleteCertificateUseCase: DeleteCertificateUseCase);
    list(issuerProfileId: number, options?: {
        search?: string;
        page?: number;
        pageSize?: number;
        attachedToBatchId?: string;
    }): Promise<{
        total: number;
        items: {
            id: number;
            title: string;
            imageUrl: string | null;
            issuedAt: Date;
            number: string | null;
            authority: string | null;
            expiryDate: Date | null;
            documentType: string | null;
            standardReference: string | null;
            scope: string | null;
            documentUrl: string | null;
        }[];
    }>;
    getById(id: number, issuerProfileId: number): Promise<CertificateDetail>;
    create(issuerProfileId: number, data: CreateCertificateData): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    update(id: number, issuerProfileId: number, data: {
        title?: string;
        imageUrl?: string;
        number?: string | null;
        authority?: string | null;
        expiryDate?: string | Date | null;
        documentType?: string | null;
        standardReference?: string | null;
        scope?: string | null;
        documentUrl?: string | null;
    }): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    delete(id: number, issuerProfileId: number): Promise<void>;
    setCertificatesForBatch(batchId: string, issuerProfileId: number, certificateIds: number[]): Promise<void>;
    getCertificateIdsByBatchId(batchId: string, issuerProfileId: number): Promise<number[]>;
}
