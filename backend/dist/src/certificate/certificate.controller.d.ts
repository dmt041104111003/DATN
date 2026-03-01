import { AuthService } from "../auth/auth.service";
import { CertificateService } from "./certificate.service";
import { CreateCertificateDto } from "./dto/certificate.dto";
export declare class CertificateController {
    private readonly certificate;
    private readonly auth;
    constructor(certificate: CertificateService, auth: AuthService);
    list(token?: string, batchId?: string, search?: string, pageStr?: string, pageSizeStr?: string): Promise<{
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
    getById(idStr: string, token?: string): Promise<{
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
    create(body: CreateCertificateDto, token?: string): Promise<{
        id: number;
        title: string;
        imageUrl: string | null;
    }>;
}
