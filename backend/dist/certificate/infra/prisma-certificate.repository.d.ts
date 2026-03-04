import { PrismaService } from "../../prisma/prisma.service";
import { CertificateDetail, CertificateListItem, CertificateRepositoryPort, CreateCertificateData, ListCertificatesOptions, UpdateCertificateData } from "../domain/certificate.repository";
export declare class PrismaCertificateRepository implements CertificateRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listCertificates(issuerProfileId: number, options?: ListCertificatesOptions): Promise<{
        total: number;
        items: CertificateListItem[];
    }>;
    getCertificateById(id: number, issuerProfileId: number): Promise<CertificateDetail | null>;
    createCertificate(issuerProfileId: number, data: CreateCertificateData): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    updateCertificate(id: number, issuerProfileId: number, data: UpdateCertificateData): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    deleteCertificate(id: number, issuerProfileId: number): Promise<void>;
    setCertificatesForBatch(batchId: string, issuerProfileId: number, certificateIds: number[]): Promise<void>;
    getCertificateIdsByBatchId(batchId: string, issuerProfileId: number): Promise<number[]>;
}
