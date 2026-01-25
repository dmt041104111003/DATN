import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
export declare class CertificationService {
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
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateCertificationDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateCertificationDto): Promise<{
        id: string;
        productId: string;
        createdAt: Date;
        updatedAt: Date;
        certName: string;
        issueDate: Date;
        expiryDate: Date | null;
        certHash: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
