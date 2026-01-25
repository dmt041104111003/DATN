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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    create(user: {
        id: string;
    }, dto: CreateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateWarehouseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        location: string | null;
        capacity: number;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
