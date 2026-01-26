import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';
export declare class ProductionProcessService {
    private prisma;
    private redis;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAll(): Promise<string | {
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateProductionProcessDto): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateProductionProcessDto): Promise<{
        id: string;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
