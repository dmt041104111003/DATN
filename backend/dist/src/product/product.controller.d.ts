import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
    findAll(): Promise<string | {
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findMy(user: {
        id: string;
    }): Promise<string | {
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getQuota(user: {
        id: string;
    }): Promise<{
        tier: string;
        maxProducts: number;
        usedProducts: number;
        remainingProducts: string | number;
    }>;
    trace(policyId: string, assetName: string): Promise<{
        product: {
            id: string;
            name: string;
            policyId: string | null;
            assetName: string | null;
            historyHash: string | null;
            documents: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                docType: string;
                url: string;
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
            assetInfo: any;
            onChainMetadata: any;
        };
    }>;
    getHistory(id: string): Promise<{
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
    findOne(id: string): Promise<string | {
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(user: {
        id: string;
    }, dto: CreateProductDto): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductDto): Promise<{
        id: string;
        userId: string;
        policyId: string | null;
        assetName: string | null;
        name: string;
        historyHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
