import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class ContractService {
    private blockfrostProvider;
    constructor();
    private createWalletFromAddress;
    getPolicyId(walletAddress: string): Promise<{
        policyId: string;
        storeAddress: string;
    }>;
    createMint(walletAddress: string, params: MintDto[]): Promise<{
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
    createUpdate(walletAddress: string, params: UpdateMetadataDto[]): Promise<{
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
