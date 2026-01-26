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
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        id: string;
        userId: string;
        materialHash: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findBySupplier(user: {
        id: string;
    }, supplierId: string): Promise<string | {
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        id: string;
        userId: string;
        materialHash: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        userId: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
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
    }, dto: CreateMaterialDto): Promise<any>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMaterialDto): Promise<any>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
