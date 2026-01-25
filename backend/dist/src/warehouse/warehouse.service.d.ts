import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehouseService {
    private prisma;
    private redis;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAll(userId: string): Promise<string | {
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateWarehouseDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
