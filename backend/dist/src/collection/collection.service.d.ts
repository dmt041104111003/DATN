import { PrismaService } from '../prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findAllByUser(userId: string): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    private findOneOwned;
    create(userId: string, dto: CreateCollectionDto): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, dto: UpdateCollectionDto): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        name: string;
        thumbnail: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
