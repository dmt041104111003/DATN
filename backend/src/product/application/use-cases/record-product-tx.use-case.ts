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
      const master = properties as any;
      const mintParams: MintBatchParams = {
        batchId: assetName,
        name,
        description: description || null,
        image: image || null,
        standard: params.standard ?? "Traceability-v1",
        mintTxHash: txHash,
        policyId: params.policyId,
        minterProfileId: profileId,
        expiryDate,
        sku: master.sku ?? null,
        gtin: master.gtin ?? null,
        hsCode: master.hsCode ?? null,
        unitOfMeasure: master.unitOfMeasure ?? null,
        productCategory: master.productCategory ?? null,
        grossWeightKg:
          master.grossWeightKg != null ? Number(master.grossWeightKg) : null,
        netWeightKg:
          master.netWeightKg != null ? Number(master.netWeightKg) : null,
        lengthCm: master.lengthCm != null ? Number(master.lengthCm) : null,
        widthCm: master.widthCm != null ? Number(master.widthCm) : null,
        heightCm: master.heightCm != null ? Number(master.heightCm) : null,
        storageCondition: master.storageCondition ?? null,
        originSiteCode: master.originSiteCode ?? null,
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
      let nextExpiryDate: Date | null = batch.expiryDate ?? null;
      const baseProps = (params.properties as any) ?? {};
      const rawNextExpiry = (baseProps as any)?.ngayHetHan;
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
        batchId: assetName,
        name: params.name ?? batch.name,
        description: nextDescription,
        image: params.image ?? batch.image,
        standard: params.standard ?? batch.standard,
        expiryDate: nextExpiryDate ?? null,
        lastUpdateTxHash: txHash,
        lastUpdateAt: new Date().toISOString(),
        sku: (baseProps as any).sku ?? batch.sku ?? null,
        gtin: (baseProps as any).gtin ?? batch.gtin ?? null,
        hsCode: (baseProps as any).hsCode ?? batch.hsCode ?? null,
        unitOfMeasure:
          (baseProps as any).unitOfMeasure ?? batch.unitOfMeasure ?? null,
        productCategory:
          (baseProps as any).productCategory ?? batch.productCategory ?? null,
        grossWeightKg:
          (baseProps as any).grossWeightKg != null
            ? Number((baseProps as any).grossWeightKg)
            : batch.grossWeightKg ?? null,
        netWeightKg:
          (baseProps as any).netWeightKg != null
            ? Number((baseProps as any).netWeightKg)
            : batch.netWeightKg ?? null,
        lengthCm:
          (baseProps as any).lengthCm != null
            ? Number((baseProps as any).lengthCm)
            : batch.lengthCm ?? null,
        widthCm:
          (baseProps as any).widthCm != null
            ? Number((baseProps as any).widthCm)
            : batch.widthCm ?? null,
        heightCm:
          (baseProps as any).heightCm != null
            ? Number((baseProps as any).heightCm)
            : batch.heightCm ?? null,
        storageCondition:
          (baseProps as any).storageCondition ??
          batch.storageCondition ??
          null,
        originSiteCode:
          (baseProps as any).originSiteCode ?? batch.originSiteCode ?? null,
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

