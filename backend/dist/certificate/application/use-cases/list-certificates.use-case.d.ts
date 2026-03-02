import { CertificateRepositoryPort, ListCertificatesOptions } from "../../domain/certificate.repository";
export declare class ListCertificatesUseCase {
    private readonly repository;
    constructor(repository: CertificateRepositoryPort);
    execute(issuerProfileId: number, options?: ListCertificatesOptions): Promise<{
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
}
