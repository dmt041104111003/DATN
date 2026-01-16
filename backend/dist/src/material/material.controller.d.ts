import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialController {
    private materialService;
    constructor(materialService: MaterialService);
    findAll(user: {
        id: string;
    }): Promise<({
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
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    })[]>;
    findBySupplier(user: {
        id: string;
    }, supplierId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
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
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    create(user: {
        id: string;
    }, dto: CreateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        harvestDate: Date | null;
        quantity: number;
    }>;
}
