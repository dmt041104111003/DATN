import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';
export declare class ProductionProcessService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateProductionProcessDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProductionProcessDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        stepName: string;
        startTime: Date;
        endTime: Date | null;
        location: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
