import { PrismaService } from '../prisma.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class MetadataService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        content: string;
        collectionId: string;
        nftReference: string[];
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    update(id: string, userId: string, dto: UpdateMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetName: string | null;
        content: string;
        collectionId: string;
        nftReference: string[];
    }>;
}
