import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateServiceDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateServiceDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
