import { CertificateRepositoryPort, UpdateCertificateData } from "../../domain/certificate.repository";
export declare class UpdateCertificateUseCase {
    private readonly repository;
    constructor(repository: CertificateRepositoryPort);
    execute(id: number, issuerProfileId: number, data: UpdateCertificateData): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
}
