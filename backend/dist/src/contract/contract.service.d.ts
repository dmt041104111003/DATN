import { OnModuleInit } from '@nestjs/common';
import { MeshAdapter } from './mesh.adapter';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
export declare class ContractService extends MeshAdapter implements OnModuleInit {
    onModuleInit(): Promise<void>;
    mint(params: MintDto[]): Promise<{
        txHash: string;
    }>;
    burn(params: BurnDto[]): Promise<{
        txHash: string;
    }>;
    update(params: UpdateMetadataDto[]): Promise<{
        txHash: string;
    }>;
    getInfo(): Promise<{
        policyId: string | undefined;
        storeAddress: string | undefined;
    }>;
}
