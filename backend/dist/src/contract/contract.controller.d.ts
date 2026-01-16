import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class ContractController {
    private contractService;
    constructor(contractService: ContractService);
    getInfo(): Promise<{
        policyId: string | undefined;
        storeAddress: string | undefined;
    }>;
    mint(user: {
        id: string;
        address: string;
    }, dto: MintDto[]): Promise<{
        txHash: string;
    }>;
    burn(user: {
        id: string;
        address: string;
    }, dto: BurnDto[]): Promise<{
        txHash: string;
    }>;
    update(user: {
        id: string;
        address: string;
    }, dto: UpdateMetadataDto[]): Promise<{
        txHash: string;
    }>;
}
