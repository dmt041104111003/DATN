import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class MetadataService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        collectionId: string;
        content: string;
        nftReference: string[];
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        collectionId: string;
        content: string;
        nftReference: string[];
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        collectionId: string;
        content: string;
        nftReference: string[];
    }>;
    update(id: string, userId: string, dto: UpdateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        collectionId: string;
        content: string;
        nftReference: string[];
    }>;
    remove(id: string, userId: string): Promise<void>;
}
