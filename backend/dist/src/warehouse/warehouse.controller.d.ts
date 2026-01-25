import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehouseController {
    private warehouseService;
    constructor(warehouseService: WarehouseService);
    findAll(user: {
        id: string;
    }): Promise<string | {
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateWarehouseDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        userId: string;
        name: string;
        location: string | null;
        capacity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
