import { AuthService } from "../auth/auth.service";
import { CertificateService } from "./certificate.service";
import { CreateCertificateDto, UpdateCertificateDto } from "./dto/certificate.dto";
export declare class CertificateController {
    private readonly certificate;
    private readonly auth;
    constructor(certificate: CertificateService, auth: AuthService);
    list(token?: string, search?: string, attachedToBatchId?: string, pageStr?: string, pageSizeStr?: string): Promise<{
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
    getCertificateIdsByBatch(batchId: string, token?: string): Promise<{
        certificateIds: number[];
    }>;
    setCertificatesForBatch(batchId: string, body: {
        certificateIds?: number[];
    }, token?: string): Promise<{
        ok: boolean;
    }>;
    getById(idStr: string, token?: string): Promise<import("./domain/certificate.repository").CertificateDetail>;
    create(body: CreateCertificateDto, token?: string): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    update(idStr: string, body: UpdateCertificateDto, token?: string): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
    delete(idStr: string, token?: string): Promise<{
        ok: boolean;
    }>;
}
