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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assetName: string | null;
        historyHash: string | null;
        policyId: string | null;
    }[]>;
    findAllByUser(userId: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assetName: string | null;
        historyHash: string | null;
        policyId: string | null;
    }[]>;
    findOne(id: string): Promise<string | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assetName: string | null;
        historyHash: string | null;
        policyId: string | null;
    }>;
    private findOneOwned;
    private getActiveSubscription;
    private checkProductLimit;
    create(userId: string, dto: CreateProductDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assetName: string | null;
        historyHash: string | null;
        policyId: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assetName: string | null;
        historyHash: string | null;
        policyId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        wasMinted: string | null;
        warning: string | null;
    }>;
    getQuota(userId: string): Promise<{
        tier: string;
        maxProducts: number;
        usedProducts: number;
        remainingProducts: string | number;
    }>;
    traceByNft(policyId: string, assetName: string): Promise<{
        product: {
            id: string;
            name: string;
            policyId: string | null;
            assetName: string | null;
            historyHash: string | null;
            documents: {
                url: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                docType: string;
                hash: string | null;
            }[];
            productionProcesses: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                stepName: string;
                startTime: Date;
                endTime: Date | null;
                location: string | null;
            }[];
            certifications: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                certName: string;
                issueDate: Date;
                expiryDate: Date | null;
                certHash: string | null;
            }[];
            warehouseStorages: ({
                warehouse: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    location: string | null;
                    capacity: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                warehouseId: string;
                entryTime: Date;
                exitTime: Date | null;
                conditions: string | null;
            })[];
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
