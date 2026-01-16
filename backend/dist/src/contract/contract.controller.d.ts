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
    createMint(walletAddress: string, assets: MintDto[]): Promise<{
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
    createUpdate(walletAddress: string, assets: UpdateMetadataDto[]): Promise<{
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
