import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateDocumentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
