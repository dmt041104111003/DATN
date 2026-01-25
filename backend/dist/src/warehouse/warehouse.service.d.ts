import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehouseService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
