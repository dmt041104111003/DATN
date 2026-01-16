import { PrismaService } from '../prisma.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';
export declare class WarehouseStorageService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
    create(dto: CreateWarehouseStorageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
    update(id: string, dto: UpdateWarehouseStorageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
}
