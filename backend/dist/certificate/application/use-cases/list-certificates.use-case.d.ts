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
            number: string | null;
            authority: string | null;
            expiryDate: Date | null;
            documentType: string | null;
            standardReference: string | null;
            scope: string | null;
            documentUrl: string | null;
        }[];
    }>;
}
