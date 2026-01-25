import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
export declare class CertificationController {
    private certificationService;
    constructor(certificationService: CertificationService);
    findAll(): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateCertificationDto): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateCertificationDto): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
