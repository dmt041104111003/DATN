import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  ORDER_REPOSITORY,
  OrderRepositoryPort,
  OrderSummary,
} from "../../domain/order.repository";

@Injectable()
export class ListOrdersForProfileUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepositoryPort
  ) {}

  async execute(profileId: number): Promise<OrderSummary[]> {
    const wallet = await this.repository.findWalletAddressByProfileId(
      profileId
    );
    if (!wallet) {
      return [];
    }
    const lower = wallet.trim().toLowerCase();
    const rows = await this.repository.findActiveDeliveriesForWallet(wallet);
    return rows
      .filter((row) => {
        const owners = Array.isArray(row.ownerAddresses)
          ? (row.ownerAddresses as string[])
          : [];
        return owners.some(
          (addr: string) => (addr || "").trim().toLowerCase() === lower
        );
      })
      .map((r): OrderSummary => ({
        id: r.id,
        lockTxHash: r.lockTxHash,
        scriptOutputIndex: r.scriptOutputIndex,
        batchId: r.batchId,
        policyId: r.policyId,
        scriptAddress: r.scriptAddress ?? null,
        datumHash: r.datumHash ?? null,
        datumJson: r.datumJson ?? null,
        recipientAddress: r.recipientAddress,
        senderAddress: r.senderAddress,
        ownerAddresses: Array.isArray(r.ownerAddresses)
          ? (r.ownerAddresses as string[])
          : [],
        status: String(r.status),
        partialSignedTxHex: r.partialSignedTxHex ?? null,
        partialSignedByAddress: r.partialSignedByAddress ?? null,
        secondSignedByAddress: r.secondSignedByAddress ?? null,
        unlockTxHash: r.unlockTxHash ?? null,
        outAt:
          r.actualDeliveryAt ??
          (String(r.status) === "DELIVERED" ? r.updatedAt ?? null : null),
      }));
  }
}

