import type { UTxO } from "@meshsdk/core";
import { CardanoService } from "../cardano/cardano.service";
import { PrismaService } from "../prisma/prisma.service";
import { WarehouseService } from "../warehouse/warehouse.service";
export type { BuildMetadataInput } from "./product.helpers";
export declare class ProductService {
    private readonly cardano;
    private readonly prisma;
    private readonly warehouse;
    constructor(cardano: CardanoService, prisma: PrismaService, warehouse: WarehouseService);
    private createContract;
    listBatches(profileId: number): Promise<{
        id: number;
        code: string;
        name: string;
        image: string | null;
        createdAt: Date;
        policyId: string | null;
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
    recordTx(params: {
        action: "MINT" | "UPDATE" | "REVOKE" | "BURN";
        txHash: string;
        assetName: string;
        profileId: number;
        name?: string;
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
