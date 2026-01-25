import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class ServiceService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        maxProducts: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
