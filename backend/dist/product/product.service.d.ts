import type { UTxO } from "@meshsdk/core";
import { CardanoService } from "../core/cardano/cardano.service";
import { WarehouseService } from "../warehouse/warehouse.service";
import { ProductRepositoryPort } from "./domain/product.repository";
import { ListBatchesUseCase } from "./application/use-cases/list-batches.use-case";
import { RecordProductTxUseCase } from "./application/use-cases/record-product-tx.use-case";
import { ListRoadmapUseCase } from "./application/use-cases/list-roadmap.use-case";
export type { BuildMetadataInput } from "./product.helpers";
export declare class ProductService {
    private readonly cardano;
    private readonly warehouse;
    private readonly productRepository;
    private readonly listBatchesUseCase;
    private readonly recordProductTxUseCase;
    private readonly listRoadmapUseCase;
    constructor(cardano: CardanoService, warehouse: WarehouseService, productRepository: ProductRepositoryPort, listBatchesUseCase: ListBatchesUseCase, recordProductTxUseCase: RecordProductTxUseCase, listRoadmapUseCase: ListRoadmapUseCase);
    private createContract;
    listBatches(profileId: number): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        image: string | null;
        createdAt: Date;
        policyId: string | null;
    }[]>;
    listRoadmap(batchCode: string): Promise<{
        hopIndex: number;
        receiverAddress: string | null;
    }[]>;
    mint(params: {
        changeAddress: string;
        assetName: string;
        metadata?: Record<string, string>;
        receiver?: string;
        name?: string;
        image?: string;
        receivers?: string[];
        receiverLocations?: string;
        receiverCoordinates?: string;
        minterLocation?: string;
        minterCoordinates?: string;
        propertiesJson?: string;
        walletUtxos?: UTxO[];
        utxoAddresses?: string[];
    }): Promise<{
        unsignedTx: string;
        policyId?: string;
    }>;
    update(params: {
        changeAddress: string;
        assetName: string;
        txHash?: string;
        metadata?: Record<string, string>;
        name?: string;
        image?: string;
        receivers?: string[];
        receiverLocations?: string;
        receiverCoordinates?: string;
        minterLocation?: string;
        minterCoordinates?: string;
        propertiesJson?: string;
        certUnit?: string;
        walletUtxos?: UTxO[];
        utxoAddresses?: string[];
    }): Promise<{
        unsignedTx: string;
    }>;
    revoke(params: {
        changeAddress: string;
        assetName: string;
        txHash?: string;
        walletUtxos?: UTxO[];
        utxoAddresses?: string[];
    }): Promise<{
        unsignedTx: string;
    }>;
    burn(params: {
        changeAddress: string;
        assetName: string;
        txHash?: string;
        policyId?: string;
        walletUtxos?: UTxO[];
        utxoAddresses?: string[];
    }): Promise<{
        unsignedTx: string;
    }>;
    getBatchSummaryByCode(code: string): Promise<{
        policyId: string | null;
        assetName: string;
        nftUnit: string | null;
    }>;
    recordTx(params: {
        action: "MINT" | "UPDATE" | "REVOKE" | "BURN";
        txHash: string;
        assetName: string;
        profileId: number;
        name?: string;
        description?: string;
        image?: string;
        standard?: string;
        properties?: object;
        metadata?: object;
        policyId?: string;
        receivers?: string[];
    }): Promise<void>;
    removeOneFromWarehouse(profileId: number, batchId: string): Promise<void>;
    addToWarehouse(profileId: number, batchId: string): Promise<void>;
    submitSignedTx(signedTxInput: string, fromBase64?: boolean): Promise<{
        txHash: string;
    }>;
}
