import { WarehouseStorageService } from './warehouse-storage.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';
export declare class WarehouseStorageController {
    private warehouseStorageService;
    constructor(warehouseStorageService: WarehouseStorageService);
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
    create(user: {
        id: string;
    }, dto: CreateWarehouseStorageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateWarehouseStorageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
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
