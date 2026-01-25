import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehouseController {
    private warehouseService;
    constructor(warehouseService: WarehouseService);
    findAll(): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        capacity: number;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        capacity: number;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        capacity: number;
    }>;
    update(id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        capacity: number;
    }>;
    remove(id: string): Promise<void>;
}
