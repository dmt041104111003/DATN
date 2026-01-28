import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
export declare class ProductMaterialService {
    private prisma;
    private redis;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findByProduct(productId: string, userId: string): Promise<string | ({
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
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreateProductMaterialDto): Promise<any>;
    update(id: string, userId: string, dto: UpdateProductMaterialDto): Promise<any>;
    remove(id: string, userId: string): Promise<void>;
    private findOneOwned;
    private checkProductOwnership;
    private checkMaterialOwnership;
}
