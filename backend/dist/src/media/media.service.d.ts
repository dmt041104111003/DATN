import { PrismaService } from '../prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
export declare class MediaService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        type: string;
    }[]>;
    findOne(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        type: string;
    }>;
    create(dto: CreateMediaDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        type: string;
    }>;
    update(id: string, dto: UpdateMediaDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        type: string;
    }>;
    remove(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        type: string;
    }>;
}
