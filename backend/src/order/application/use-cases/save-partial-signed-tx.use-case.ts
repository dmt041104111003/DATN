import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  ORDER_REPOSITORY,
  OrderRepositoryPort,
} from "../../domain/order.repository";

@Injectable()
export class SavePartialSignedTxUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: OrderRepositoryPort
  ) {}

  async execute(
    deliveryId: number,
    profileId: number,
    partialTxHex: string
  ): Promise<{ ok: boolean }> {
    const hex = (partialTxHex || "").trim().replace(/^0x/, "");
    if (hex.length < 100) {
      throw new BadRequestException("partialTxHex is too short.");
    }

    const wallet = await this.repository.findWalletAddressByProfileId(
      profileId
    );
    if (!wallet?.trim()) {
      throw new BadRequestException("Profile or wallet not found.");
    }

    await this.repository.savePartialSignedTx(
      deliveryId,
      wallet.trim(),
      hex
    );
    return { ok: true };
  }
}

