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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    create(userId: string, dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    update(id: string, userId: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
