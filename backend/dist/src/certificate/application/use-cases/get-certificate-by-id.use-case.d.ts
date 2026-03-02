import { CertificateDetail, CertificateRepositoryPort } from "../../domain/certificate.repository";
export declare class GetCertificateByIdUseCase {
    private readonly repository;
    constructor(repository: CertificateRepositoryPort);
    execute(id: number, issuerProfileId: number): Promise<CertificateDetail>;
}
