import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionService {
    private prisma;
    private redis;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAll(): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findAllByUser(userId: string): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateCollectionDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateCollectionDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
