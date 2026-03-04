import { CertificateRepositoryPort } from "../../domain/certificate.repository";
export declare class DeleteCertificateUseCase {
    private readonly repository;
    constructor(repository: CertificateRepositoryPort);
    execute(id: number, issuerProfileId: number): Promise<void>;
}
