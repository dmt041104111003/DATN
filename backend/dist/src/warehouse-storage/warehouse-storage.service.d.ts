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
    private findOneOwned;
    create(userId: string, dto: CreateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
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
