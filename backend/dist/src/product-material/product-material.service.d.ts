import { PrismaService } from '../prisma.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
export declare class ProductMaterialService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProduct(productId: string, userId: string): Promise<({
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
    create(userId: string, dto: CreateProductMaterialDto): Promise<{
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
    update(id: string, userId: string, dto: UpdateProductMaterialDto): Promise<{
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
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        materialId: string;
        quantity: number;
        unit: string | null;
    }>;
    private findOneOwned;
    private checkProductOwnership;
    private checkMaterialOwnership;
}
