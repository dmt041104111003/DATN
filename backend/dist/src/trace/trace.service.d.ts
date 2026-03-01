import type { UTxO } from "@meshsdk/core";
import { CardanoService } from "../cardano/cardano.service";
import { PrismaService } from "../prisma/prisma.service";
export type { BuildMetadataInput } from "./trace.helpers";
export declare class TraceService {
    private readonly cardano;
    private readonly prisma;
    constructor(cardano: CardanoService, prisma: PrismaService);
    private createContract;
    listBatches(profileId: number): Promise<{
        id: string;
        name: string;
        image: string | null;
        createdAt: Date;
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
    recordTx(params: {
        action: "MINT" | "UPDATE" | "REVOKE";
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
    submitSignedTx(signedTxInput: string, fromBase64?: boolean): Promise<{
        txHash: string;
    }>;
}
