import { ContractCreateDto } from './dto/contract-create.dto';
import { ContractBatchCreateDto } from './dto/contract-batch-create.dto';
import { ContractSaveDto } from './dto/contract-save.dto';
import { ContractBurnDto } from './dto/contract-burn.dto';
export declare class ContractService {
    private readonly blockfrostProvider;
    private readonly plutusHelper;
    private readonly txBuilderHelper;
    constructor();
    private generateCode;
    private decodeAssetNameFromUnit;
    private loadOnchainMetadata;
    private blockfrostBaseUrl;
    private parseOwners;
    private parseOwnersFromMetadata;
    private loadOwnersFromInventoryKey;
    private stringifyMetadata;
    getInfo(owners: string[]): Promise<{
        schemeReference: string;
        custodyVaultAddress: string;
    }>;
    createUnsignedCreateTx(dto: ContractCreateDto, signerAddressRaw: unknown): Promise<{
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
    createUnsignedBatchCreateTx(dto: ContractBatchCreateDto, signerAddressRaw: unknown): Promise<{
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
    private buildUnsignedMintResult;
    createUnsignedSaveTx(dto: ContractSaveDto, signerAddressRaw: unknown): Promise<{
        result: boolean;
        data: string;
        message: string;
    }>;
    createUnsignedBurnTx(dto: ContractBurnDto, signerAddressRaw: unknown): Promise<{
        result: boolean;
        data: string;
        message: string;
    }>;
}
