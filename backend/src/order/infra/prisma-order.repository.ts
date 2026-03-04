import { Injectable } from "@nestjs/common";
import { Prisma, DeliveryStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CompleteOrderParams,
  DeliveryOrderRow,
  OrderRecordParams,
  OrderRepositoryPort,
  OrderSummary,
} from "../domain/order.repository";

@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findWalletAddressByProfileId(
    profileId: number
  ): Promise<string | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { walletAddress: true },
    });
    const addr = profile?.walletAddress?.trim();
    return addr && addr.length > 0 ? addr : null;
  }

  async findActiveDeliveriesForWallet(
    walletAddress: string
  ): Promise<DeliveryOrderRow[]> {
    const rows = await this.prisma.deliveryOrder.findMany({
      where: {
        status: { in: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED] },
        NOT: { senderAddress: walletAddress },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows as unknown as DeliveryOrderRow[];
  }

  async savePartialSignedTx(
    deliveryId: number,
    walletAddress: string,
    partialTxHex: string
  ): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE "DeliveryOrder" SET "partialSignedTxHex" = ${partialTxHex}, "partialSignedByAddress" = ${walletAddress} WHERE id = ${deliveryId}`,
    );
  }

  async upsertDeliveryOrder(
    params: OrderRecordParams
  ): Promise<{ id: number }> {
    const scriptOutputIndex = params.scriptOutputIndex ?? 0;
    const ownerAddresses = Array.isArray(params.ownerAddresses)
      ? params.ownerAddresses
      : [];
    const delivery = await this.prisma.deliveryOrder.upsert({
      where: {
        lockTxHash_scriptOutputIndex: {
          lockTxHash: params.lockTxHash.trim(),
          scriptOutputIndex,
        },
      },
      create: {
        lockTxHash: params.lockTxHash.trim(),
        scriptOutputIndex,
        batchId: params.batchId.trim(),
        policyId: params.policyId?.trim() ?? null,
        scriptAddress: params.scriptAddress?.trim() ?? null,
        datumHash: params.datumHash?.trim() ?? null,
        datumJson: params.datumJson ?? null,
        recipientAddress: params.recipientAddress.trim(),
        senderAddress: params.senderAddress.trim(),
        ownerAddresses,
        status: DeliveryStatus.IN_TRANSIT,
      },
      update: {},
    });
    return { id: delivery.id };
  }

  async findActiveDeliveryById(
    id: number
  ): Promise<{ id: number; batchId: string; recipientAddress: string } | null> {
    const found = await this.prisma.deliveryOrder.findUnique({
      where: { id },
    });
    if (!found || found.status !== DeliveryStatus.IN_TRANSIT) return null;
    return {
      id: found.id,
      batchId: found.batchId,
      recipientAddress: found.recipientAddress,
    };
  }

  async findActiveDeliveryByLockHashAndIndex(
    lockTxHash: string,
    scriptOutputIndex: number
  ): Promise<{
    id: number;
    batchId: string;
    recipientAddress: string;
  } | null> {
    const found = await this.prisma.deliveryOrder.findUnique({
      where: {
        lockTxHash_scriptOutputIndex: {
          lockTxHash,
          scriptOutputIndex,
        },
      },
    });
    if (!found || found.status !== DeliveryStatus.IN_TRANSIT) return null;
    return {
      id: found.id,
      batchId: found.batchId,
      recipientAddress: found.recipientAddress,
    };
  }

  async markOrderDelivered(
    id: number,
    unlockTxHash: string,
    secondSignedByAddress: string | null
  ): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE "DeliveryOrder" SET status = 'DELIVERED', "unlockTxHash" = ${unlockTxHash}, "secondSignedByAddress" = ${secondSignedByAddress} WHERE id = ${id}`,
    );
  }
}

