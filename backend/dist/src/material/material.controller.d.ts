import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialController {
    private materialService;
    constructor(materialService: MaterialService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    create(dto: CreateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    update(id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
}
