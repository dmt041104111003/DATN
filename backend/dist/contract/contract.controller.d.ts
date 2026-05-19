import { ContractService } from './contract.service';
import { ContractCreateDto } from './dto/contract-create.dto';
import { ContractBatchCreateDto } from './dto/contract-batch-create.dto';
import { ContractSaveDto } from './dto/contract-save.dto';
import { ContractBurnDto } from './dto/contract-burn.dto';
export declare class ContractController {
    private readonly svc;
    constructor(svc: ContractService);
    private getSignerAddress;
    info(ownersParam: string): Promise<{
        schemeReference: string;
        custodyVaultAddress: string;
    }>;
    create(req: any, dto: ContractCreateDto): Promise<{
        result: boolean;
        data: string;
        message: string;
        traceSchemeRef: string;
        assetName: string;
        inventoryKey: string;
        items: {
            assetName: string;
            inventoryKey: string;
        }[];
    }>;
    createBatch(req: any, dto: ContractBatchCreateDto): Promise<{
        result: boolean;
        data: string;
        message: string;
        traceSchemeRef: string;
        assetName: string;
        inventoryKey: string;
        items: {
            assetName: string;
            inventoryKey: string;
        }[];
    }>;
    save(req: any, dto: ContractSaveDto): Promise<{
        result: boolean;
        data: string;
        message: string;
    }>;
    burn(req: any, dto: ContractBurnDto): Promise<{
        result: boolean;
        data: string;
        message: string;
    }>;
}
