import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialController {
    private materialService;
    constructor(materialService: MaterialService);
    findAll(user: {
        id: string;
    }): Promise<string | ({
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    })[]>;
    findBySupplier(user: {
        id: string;
    }, supplierId: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
        supplier: {
            id: string;
            userId: string;
            name: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    create(user: {
        id: string;
    }, dto: CreateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
