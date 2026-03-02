import { PrismaService } from "../../prisma/prisma.service";
import { DeliveryOrderRow, OrderRecordParams, OrderRepositoryPort } from "../domain/order.repository";
export declare class PrismaOrderRepository implements OrderRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findWalletAddressByProfileId(profileId: number): Promise<string | null>;
    findActiveDeliveriesForWallet(walletAddress: string): Promise<DeliveryOrderRow[]>;
    savePartialSignedTx(deliveryId: number, walletAddress: string, partialTxHex: string): Promise<void>;
    upsertDeliveryOrder(params: OrderRecordParams): Promise<{
        id: number;
    }>;
    findActiveDeliveryById(id: number): Promise<{
        id: number;
        batchId: string;
        recipientAddress: string;
    } | null>;
    findActiveDeliveryByLockHashAndIndex(lockTxHash: string, scriptOutputIndex: number): Promise<{
        id: number;
        batchId: string;
        recipientAddress: string;
    } | null>;
    markOrderDelivered(id: number, unlockTxHash: string, secondSignedByAddress: string | null): Promise<void>;
}
