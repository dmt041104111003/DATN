import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private prisma;
    private redis;
    private blockchain;
    private subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, blockchain: BlockchainService, subscriptionService: SubscriptionService);
    private checkSubscriptionActive;
    findAll(): Promise<string | {
        id: string;
        userId: string;
        policyId: string;
        assetName: string;
        name: string;
        materialsRoot: string;
        certificationsRoot: string;
        mediaRoot: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllByUser(userId: string): Promise<string | {
        id: string;
        userId: string;
        policyId: string;
        assetName: string;
        name: string;
        materialsRoot: string;
        certificationsRoot: string;
        mediaRoot: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        userId: string;
        policyId: string;
        assetName: string;
        name: string;
        materialsRoot: string;
        certificationsRoot: string;
        mediaRoot: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private findOneOwned;
    private getActiveSubscription;
    private checkProductLimit;
    create(userId: string, dto: CreateProductDto): Promise<any>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        id: string;
        userId: string;
        policyId: string;
        assetName: string;
        name: string;
        materialsRoot: string;
        certificationsRoot: string;
        mediaRoot: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        wasMinted: string;
        warning: string | null;
    }>;
    getQuota(userId: string): Promise<{
        tier: string;
        maxProducts: number | null;
        usedProducts: number;
        remainingProducts: string | number;
    }>;
    traceByNft(policyId: string, assetName: string): Promise<{
        product: {
            id: string;
            name: string;
            policyId: string;
            assetName: string;
            certifications: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                certName: string;
                issueDate: Date;
                expiryDate: Date | null;
                certHash: string;
            }[];
            materials: {
                name: string;
                quantity: number;
                unit: string | null;
                harvestDate: Date | null;
                supplier: {
                    name: string;
                    location: string | null;
                };
            }[];
            owner: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        blockchain: {
            policyId: string;
            assetName: string;
            assetInfo: any;
            onChainMetadata: any;
        };
    }>;
    getHistory(productId: string): Promise<{
        product: {
            id: string;
            name: string;
            policyId?: undefined;
            assetName?: undefined;
        };
        history: never[];
        message: string;
    } | {
        product: {
            id: string;
            name: string;
            policyId: string;
            assetName: string;
        };
        history: ({
            txHash: string;
            action: "minted" | "burned";
            amount: string;
            blockTime: number;
            blockHeight: number;
        } | {
            txHash: string;
            action: "minted" | "burned";
            amount: string;
            blockTime?: undefined;
            blockHeight?: undefined;
        })[];
        message?: undefined;
    }>;
    private toHex;
}
