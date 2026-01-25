import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { ProductService } from '../product/product.service';
import { PrismaService } from '../prisma.service';
export declare class ContractService {
    private subscriptionService;
    private productService;
    private prisma;
    private blockfrostProvider;
    constructor(subscriptionService: SubscriptionService, productService: ProductService, prisma: PrismaService);
    private checkSubscriptionActive;
    private verifyProductOwnership;
    prepareProductMetadata(productId: string, userId: string): Promise<Record<string, any>>;
    private createWalletFromAddress;
    getPolicyId(walletAddress: string): {
        policyId: string;
        storeAddress: string;
    };
    createMint(walletAddress: string, params: MintDto[], userId?: string): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
    createBurn(walletAddress: string, params: BurnDto[]): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
    createUpdate(walletAddress: string, params: UpdateMetadataDto[], userId?: string, productId?: string): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
    createPayment(walletAddress: string, amount: string): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
}
