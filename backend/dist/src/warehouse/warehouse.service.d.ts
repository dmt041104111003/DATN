import { PrismaService } from '../prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehouseService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
