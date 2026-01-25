import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class ContractController {
    private readonly contractService;
    constructor(contractService: ContractService);
    getInfo(walletAddress: string): Promise<{
        policyId: string;
        storeAddress: string;
    }>;
    prepareMetadata(user: {
        id: string;
    } | undefined, productId: string): Promise<Record<string, any>>;
    createMint(user: {
        id: string;
    } | undefined, walletAddress: string, assets: MintDto[]): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
    createBurn(walletAddress: string, assets: BurnDto[]): Promise<{
        result: boolean;
        data: string;
        message: string;
    } | {
        result: boolean;
        data: null;
        message: string;
    }>;
    createUpdate(user: {
        id: string;
    } | undefined, walletAddress: string, assets: UpdateMetadataDto[], productId?: string): Promise<{
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
