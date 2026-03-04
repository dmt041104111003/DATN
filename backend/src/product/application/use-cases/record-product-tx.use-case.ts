import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  MintBatchParams,
  ProductRepositoryPort,
} from "../../domain/product.repository";
import { WarehouseService } from "../../../warehouse/warehouse.service";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class RecordProductTxUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort,
    private readonly warehouse: WarehouseService,
    private readonly prisma: PrismaService
  ) {}

  async execute(params: {
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
  }): Promise<void> {
    const { action, txHash, assetName, profileId } = params;

    if (action === "MINT") {
      const name = params.name ?? "";
      const description = params.description ?? "";
      const image = params.image ?? "";
      const properties = params.properties != null ? params.properties : {};
      let expiryDate: Date | undefined;
      const rawExpiry =
        (properties as any)?.ngayHetHan ??
        (params.properties as any)?.ngayHetHan ??
        undefined;
      if (rawExpiry) {
        const d =
          rawExpiry instanceof Date ? rawExpiry : new Date(String(rawExpiry));
        if (!Number.isNaN(d.getTime())) {
          expiryDate = d;
        }
      }
      const mintParams: MintBatchParams = {
        code: assetName,
        name,
        description: description || null,
        image: image || null,
        standard: params.standard ?? "Traceability-v1",
        mintTxHash: txHash,
        policyId: params.policyId,
        minterProfileId: profileId,
        expiryDate,
      };

      await this.repository.upsertBatchOnMint(mintParams);

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        const profile = await (this.prisma as any).profile.findUnique({
          where: { id: profileId },
          select: { walletAddress: true },
        });
        const senderAddress =
          profile?.walletAddress && typeof profile.walletAddress === "string"
            ? profile.walletAddress.trim()
            : "";
        await this.repository.createRoadmaps(
          assetName,
          "MINT",
          senderAddress,
          receivers,
          txHash
        );
      }

      await this.warehouse.addToWarehouse(profileId, assetName);
      return;
    }

    const batch = await this.repository.findBatchByCode(assetName);
    if (!batch) {
      throw new BadRequestException(`Batch not found: ${assetName}`);
    }

    if (action === "UPDATE") {
      let nextExpiryDate: Date | null = null;
      const baseProps =
        (params.properties as any) ?? {};
      const rawNextExpiry =
        (baseProps as any)?.ngayHetHan ??
        ((batch.properties as any)?.ngayHetHan as unknown);
      if (rawNextExpiry) {
        const d =
          rawNextExpiry instanceof Date
            ? rawNextExpiry
            : new Date(String(rawNextExpiry));
        if (!Number.isNaN(d.getTime())) {
          nextExpiryDate = d;
        }
      }
      const nextDescription =
        params.description !== undefined
          ? params.description
          : (batch.description as string | null);

      await this.repository.updateBatch({
        code: assetName,
        name: params.name ?? batch.name,
        description: nextDescription,
        image: params.image ?? batch.image,
        standard: params.standard ?? batch.standard,
        expiryDate: nextExpiryDate ?? null,
        lastUpdateTxHash: txHash,
        lastUpdateAt: new Date().toISOString(),
      });

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        const profile = await (this.prisma as any).profile.findUnique({
          where: { id: profileId },
          select: { walletAddress: true },
        });
        const senderAddress =
          profile?.walletAddress && typeof profile.walletAddress === "string"
            ? profile.walletAddress.trim()
            : "";
        await this.repository.createRoadmaps(
          assetName,
          "UPDATE",
          senderAddress,
          receivers,
          txHash
        );
      }
      return;
    }

    if (action === "REVOKE") {
      await this.repository.markBatchRevoked(assetName);

      const receivers = params.receivers ?? [];
      if (receivers.length > 0) {
        const profile = await (this.prisma as any).profile.findUnique({
          where: { id: profileId },
          select: { walletAddress: true },
        });
        const senderAddress =
          profile?.walletAddress && typeof profile.walletAddress === "string"
            ? profile.walletAddress.trim()
            : "";
        await this.repository.createRoadmaps(
          assetName,
          "REVOKE",
          senderAddress,
          receivers,
          txHash
        );
      }
      return;
    }

    if (action === "BURN") {
      await this.repository.markBatchBurned(assetName);
      await this.warehouse.markAsBurned(profileId, assetName);
      return;
    }
  }
}

