import { PrismaService } from '../prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateDocumentDto): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateDocumentDto): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
