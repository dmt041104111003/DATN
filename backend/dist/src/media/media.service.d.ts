import { PrismaService } from '../prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    create(userId: string, dto: CreateMediaDto): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, dto: UpdateMediaDto): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        name: string;
        type: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
