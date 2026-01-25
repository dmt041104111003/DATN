import { ProductMaterialService } from './product-material.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
export declare class ProductMaterialController {
    private service;
    constructor(service: ProductMaterialService);
    findByProduct(user: {
        id: string;
    }, productId: string): Promise<({
        material: {
            supplier: {
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                gpsCoordinates: string | null;
                contactInfo: string | null;
                userId: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            policyId: string | null;
            assetName: string | null;
            imageUrl: string | null;
            description: string | null;
            historyHash: string | null;
        };
        material: {
            supplier: {
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                gpsCoordinates: string | null;
                contactInfo: string | null;
                userId: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
    create(user: {
        id: string;
    }, dto: CreateProductMaterialDto): Promise<{
        material: {
            supplier: {
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                gpsCoordinates: string | null;
                contactInfo: string | null;
                userId: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                gpsCoordinates: string | null;
                contactInfo: string | null;
                userId: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
    }>;
}
