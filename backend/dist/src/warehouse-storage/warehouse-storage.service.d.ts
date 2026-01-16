import { PrismaService } from '../prisma.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';
export declare class WarehouseStorageService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
