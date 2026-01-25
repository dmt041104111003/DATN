import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
export declare class CertificationController {
    private certificationService;
    constructor(certificationService: CertificationService);
    findAll(): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateCertificationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateCertificationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
