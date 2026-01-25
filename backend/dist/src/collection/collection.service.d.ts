import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findAllByUser(userId: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateCollectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateCollectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        name: string;
        thumbnail: string | null;
        description: string | null;
    }>;
    remove(id: string, userId: string): Promise<void>;
}
