import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAllByUser(userId: string): Promise<string | ({
        supplier: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        id: string;
        userId: string;
        materialHash: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findBySupplier(supplierId: string, userId: string): Promise<string | {
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        id: string;
        userId: string;
        materialHash: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        supplier: {
            id: string;
            userId: string;
            name: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    create(userId: string, dto: CreateMaterialDto): Promise<any>;
    update(id: string, userId: string, dto: UpdateMaterialDto): Promise<any>;
    remove(id: string, userId: string): Promise<void>;
}
