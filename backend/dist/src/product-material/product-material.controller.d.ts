import { ProductMaterialService } from './product-material.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
export declare class ProductMaterialController {
    private service;
    constructor(service: ProductMaterialService);
    findByProduct(user: {
        id: string;
    }, productId: string): Promise<string | ({
        material: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
    })[]>;
    findOne(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
        createdAt: Date;
        updatedAt: Date;
        product: {
            id: string;
            userId: string;
            name: string;
            policyId: string | null;
            assetName: string | null;
            historyHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        material: {
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
        };
    }>;
    create(user: {
        id: string;
    }, dto: CreateProductMaterialDto): Promise<{
        material: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductMaterialDto): Promise<{
        material: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
