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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    })[]>;
    findBySupplier(user: {
        id: string;
    }, supplierId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        supplier: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            location: string | null;
            gpsCoordinates: string | null;
            contactInfo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        quantity: number;
        supplierId: string;
        harvestDate: Date | null;
    }>;
}
