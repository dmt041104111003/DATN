import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentService {
    private prisma;
    private redis;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAll(): Promise<string | {
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateDocumentDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateDocumentDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        docType: string;
        url: string;
        hash: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
