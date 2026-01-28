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
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
                gpsCoordinates: string | null;
                contactInfo: string | null;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            supplierId: string;
            harvestDate: Date | null;
            materialHash: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
        pmHash: string;
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
            policyId: string;
            assetName: string;
            createdAt: Date;
            updatedAt: Date;
        };
        material: {
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
        };
    }>;
    create(user: {
        id: string;
    }, dto: CreateProductMaterialDto): Promise<any>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductMaterialDto): Promise<any>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
