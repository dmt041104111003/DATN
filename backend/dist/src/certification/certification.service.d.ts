import { PrismaService } from '../prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
export declare class CertificationService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(dto: CreateCertificationDto): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateCertificationDto): Promise<{
        id: string;
        productId: string;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
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
