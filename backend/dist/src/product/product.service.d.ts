import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private prisma;
    private blockchain;
    constructor(prisma: PrismaService, blockchain: BlockchainService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }[]>;
    findAllByUser(userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    private findOneOwned;
    private getActiveSubscription;
    private checkProductLimit;
    create(userId: string, dto: CreateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        assetName: string | null;
        userId: string;
        policyId: string | null;
        historyHash: string | null;
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
            description: string | null;
            imageUrl: string | null;
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
            assetInfo: {
                asset: string;
                policy_id: string;
                asset_name: string | null;
                fingerprint: string;
                quantity: string;
                initial_mint_tx_hash: string;
                mint_or_burn_count: number;
                onchain_metadata: {
                    [key: string]: unknown;
                } | null;
                onchain_metadata_standard?: "CIP25v1" | "CIP25v2" | "CIP68v1" | "CIP68v2" | "CIP68v3" | null;
                onchain_metadata_extra?: string | null;
                metadata: {
                    name: string;
                    description: string;
                    ticker: string | null;
                    url: string | null;
                    logo: string | null;
                    decimals: number | null;
                } | null;
            } | null;
            onChainMetadata: {
                datum: string;
                address: string;
            } | null;
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
