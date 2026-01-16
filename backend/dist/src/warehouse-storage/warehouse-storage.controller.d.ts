import { WarehouseStorageService } from './warehouse-storage.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';
export declare class WarehouseStorageController {
    private warehouseStorageService;
    constructor(warehouseStorageService: WarehouseStorageService);
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
    create(user: {
        id: string;
    }, dto: CreateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateWarehouseStorageDto): Promise<{
        id: string;
        productId: string;
        warehouseId: string;
        entryTime: Date;
        exitTime: Date | null;
        conditions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
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
