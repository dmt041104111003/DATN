import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SupplierService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAllByUser(userId: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    create(userId: string, dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        userId: string;
        gpsCoordinates: string | null;
        contactInfo: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
