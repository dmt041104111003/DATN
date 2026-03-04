import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  ORDER_REPOSITORY,
  CompleteOrderParams,
  OrderRepositoryPort,
} from "../../domain/order.repository";
import { blockfrostFetcher } from "../../../core/cardano/standalone";
import { PrismaService } from "../../../prisma/prisma.service";
import { ProductService } from "../../../product/product.service";

@Injectable()
export class ConfirmOrderCompleteUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepositoryPort,
    private readonly prisma: PrismaService,
    private readonly product: ProductService
  ) {}

  async execute(
    params: CompleteOrderParams
  ): Promise<{ ok: boolean; recipientAddress?: string }> {
    const { unlockTxHash, witnessCount, signedByAddress, deliveryId } =
      params;
    if (witnessCount < 2) {
      throw new BadRequestException(
        "Order completion requires at least 2 signatures (witnessCount >= 2).",
      );
    }

    let delivery:
      | { id: number; batchId: string; recipientAddress: string }
      | null = null;

    if (
      deliveryId != null &&
      Number.isInteger(deliveryId) &&
      deliveryId > 0
    ) {
      const found = await this.repository.findActiveDeliveryById(
        deliveryId
      );
      if (found) {
        delivery = found;
      }
    }

    if (!delivery) {
      const tx = await blockfrostFetcher.fetchTransactionsUTxO(
        unlockTxHash.trim(),
      );
      const inputs = tx?.inputs ?? [];
      for (const inp of inputs) {
        const lockTxHash = inp.tx_hash;
        const scriptOutputIndex = inp.output_index ?? 0;
        const found =
          await this.repository.findActiveDeliveryByLockHashAndIndex(
            lockTxHash,
            scriptOutputIndex,
          );
        if (found) {
          delivery = found;
          break;
        }
      }
    }

    if (!delivery) {
      throw new BadRequestException(
        "No matching order (IN_TRANSIT) found for this completion tx. Ensure order was confirmed first, or pass deliveryId.",
      );
    }

    const secondAddr = (signedByAddress || "").trim() || null;

    await this.repository.markOrderDelivered(
      delivery.id,
      unlockTxHash.trim(),
      secondAddr,
    );

    const profile = await this.prisma.profile.findFirst({
      where: {
        walletAddress: delivery.recipientAddress.trim(),
        roleCode: { in: ["TRANSIT", "AGENT"] },
      },
      select: { id: true },
    });

    if (profile) {
      await this.product.addToWarehouse(profile.id, delivery.batchId);
    }

    return { ok: true, recipientAddress: delivery.recipientAddress };
  }
}

