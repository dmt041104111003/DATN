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
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            userId: string;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supplierId: string;
        harvestDate: Date | null;
        materialHash: string;
    })[]>;
    findBySupplier(supplierId: string, userId: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supplierId: string;
        harvestDate: Date | null;
        materialHash: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
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
    } | ({
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            userId: string;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supplierId: string;
        harvestDate: Date | null;
        materialHash: string;
    })>;
    create(userId: string, dto: CreateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supplierId: string;
        harvestDate: Date | null;
        materialHash: string;
    }>;
    update(id: string, userId: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        supplierId: string;
        harvestDate: Date | null;
        materialHash: string;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
