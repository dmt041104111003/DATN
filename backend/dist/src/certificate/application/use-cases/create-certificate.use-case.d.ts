import { CertificateRepositoryPort, CreateCertificateData } from "../../domain/certificate.repository";
export declare class CreateCertificateUseCase {
    private readonly repository;
    constructor(repository: CertificateRepositoryPort);
    execute(issuerProfileId: number, data: CreateCertificateData): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
}
