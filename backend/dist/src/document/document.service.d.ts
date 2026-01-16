import { PrismaService } from '../prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateDocumentDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateDocumentDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        hash: string | null;
    }>;
}
