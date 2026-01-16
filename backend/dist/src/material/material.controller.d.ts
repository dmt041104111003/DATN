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
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            userId: string;
        };
    } & {
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findBySupplier(user: {
        id: string;
    }, supplierId: string): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
            userId: string;
        };
    } & {
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateMaterialDto): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        supplierId: string;
        name: string;
        harvestDate: Date | null;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
