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
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateSupplierDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        gpsCoordinates: string | null;
        contactInfo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
