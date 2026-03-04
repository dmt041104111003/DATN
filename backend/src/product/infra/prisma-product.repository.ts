import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  MintBatchParams,
  ProductBatchListItem,
  ProductBatchSnapshot,
  ProductRepositoryPort,
  UpdateBatchParams,
  ProductRoadmapHop,
} from "../domain/product.repository";

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listBatchesByMinter(
    profileId: number
  ): Promise<ProductBatchListItem[]> {
    const items = await (this.prisma as any).productBatch.findMany({
      where: { minterProfileId: profileId, revoked: false },
      select: {
        id: true,
        batchId: true,
        name: true,
        description: true,
        image: true,
        createdAt: true,
        policyId: true,
        sku: true,
        grossWeightKg: true,
        netWeightKg: true,
        originSiteCode: true,
      },
      orderBy: [{ createdAt: "asc" }, { batchId: "asc" }],
    });
    if (!Array.isArray(items)) return [];
    return items.map(
      (b): ProductBatchListItem => ({
        id: b.id,
        batchId: b.batchId,
        name: b.name,
        description: b.description ?? null,
        image: b.image ?? null,
        createdAt: b.createdAt,
        policyId: b.policyId ?? null,
        sku: b.sku ?? null,
        grossWeightKg: b.grossWeightKg ?? null,
        netWeightKg: b.netWeightKg ?? null,
        originSiteCode: b.originSiteCode ?? null,
      })
    );
  }

  async upsertBatchOnMint(params: MintBatchParams): Promise<void> {
    const {
      batchId,
      name,
      description,
      image,
      standard,
      mintTxHash,
      policyId,
      minterProfileId,
      expiryDate,
      sku,
      gtin,
      hsCode,
      grossWeightKg,
      netWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      originSiteCode,
      referenceUtxo,
    } = params;
    await (this.prisma as any).productBatch.upsert({
      where: { batchId },
      create: {
        batchId,
        name,
        description,
        image,
        standard,
        mintTxHash,
        policyId: policyId ?? undefined,
        minterProfileId,
        ...(expiryDate !== undefined && { expiryDate }),
        ...(sku !== undefined && { sku }),
        ...(gtin !== undefined && { gtin }),
        ...(hsCode !== undefined && { hsCode }),
        ...(grossWeightKg !== undefined && { grossWeightKg }),
        ...(netWeightKg !== undefined && { netWeightKg }),
        ...(lengthCm !== undefined && { lengthCm }),
        ...(widthCm !== undefined && { widthCm }),
        ...(heightCm !== undefined && { heightCm }),
        ...(originSiteCode !== undefined && { originSiteCode }),
        ...(referenceUtxo !== undefined && { referenceUtxo }),
      },
      update: {
        mintTxHash,
        name,
        description,
        image,
        standard,
        policyId: policyId ?? undefined,
        ...(expiryDate !== undefined && { expiryDate }),
        ...(sku !== undefined && { sku }),
        ...(gtin !== undefined && { gtin }),
        ...(hsCode !== undefined && { hsCode }),
        ...(grossWeightKg !== undefined && { grossWeightKg }),
        ...(netWeightKg !== undefined && { netWeightKg }),
        ...(lengthCm !== undefined && { lengthCm }),
        ...(widthCm !== undefined && { widthCm }),
        ...(heightCm !== undefined && { heightCm }),
        ...(originSiteCode !== undefined && { originSiteCode }),
        ...(referenceUtxo !== undefined && { referenceUtxo }),
      },
    });
  }

  async findBatchByCode(code: string): Promise<ProductBatchSnapshot | null> {
    const batch = await (this.prisma as any).productBatch.findUnique({
      where: { batchId: code },
    });
    if (!batch) return null;
    return {
      batchId: batch.batchId,
      name: batch.name,
      description: batch.description ?? null,
      image: batch.image ?? null,
      standard: batch.standard ?? null,
      policyId: batch.policyId ?? null,
      expiryDate: batch.expiryDate ?? null,
      sku: batch.sku ?? null,
      gtin: batch.gtin ?? null,
      hsCode: batch.hsCode ?? null,
      grossWeightKg: batch.grossWeightKg ?? null,
      netWeightKg: batch.netWeightKg ?? null,
      lengthCm: batch.lengthCm ?? null,
      widthCm: batch.widthCm ?? null,
      heightCm: batch.heightCm ?? null,
      originSiteCode: batch.originSiteCode ?? null,
      referenceUtxo: batch.referenceUtxo ?? null,
      lastUpdateTxHash: batch.lastUpdateTxHash ?? null,
      lastUpdateAt: batch.lastUpdateAt ?? null,
      revokeTxHash: batch.revokeTxHash ?? null,
      revokedAt: batch.revokedAt ?? null,
      revoked: batch.revoked ?? false,
      burnTxHash: batch.burnTxHash ?? null,
      burnedAt: batch.burnedAt ?? null,
      burned: batch.burned ?? false,
    };
  }

  async getMinterWalletAddressByBatchCode(code: string): Promise<string | null> {
    const row = await (this.prisma as any).productBatch.findUnique({
      where: { batchId: code },
      select: {
        minterProfile: {
          select: {
            walletAddress: true,
          },
        },
      },
    });
    const addr = row?.minterProfile?.walletAddress;
    return typeof addr === "string" && addr.trim() ? addr.trim() : null;
  }

  async updateBatch(params: UpdateBatchParams): Promise<void> {
    const {
      batchId,
      name,
      description,
      image,
      standard,
      expiryDate,
      lastUpdateTxHash,
      lastUpdateAt,
      sku,
      gtin,
      hsCode,
      grossWeightKg,
      netWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      originSiteCode,
    } = params;
    await (this.prisma as any).productBatch.update({
      where: { batchId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(standard !== undefined && { standard }),
        ...(expiryDate !== undefined && { expiryDate }),
        ...(lastUpdateTxHash !== undefined && { lastUpdateTxHash }),
        ...(lastUpdateAt !== undefined && { lastUpdateAt }),
        ...(sku !== undefined && { sku }),
        ...(gtin !== undefined && { gtin }),
        ...(hsCode !== undefined && { hsCode }),
        ...(grossWeightKg !== undefined && { grossWeightKg }),
        ...(netWeightKg !== undefined && { netWeightKg }),
        ...(lengthCm !== undefined && { lengthCm }),
        ...(widthCm !== undefined && { widthCm }),
        ...(heightCm !== undefined && { heightCm }),
        ...(originSiteCode !== undefined && { originSiteCode }),
      },
    });
  }

  async markBatchRevoked(code: string): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { batchId: code },
      data: {
        revoked: true,
        revokeTxHash: undefined,
        revokedAt: new Date(),
      },
    });
  }

  async markBatchBurned(code: string, burnTxHash: string): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { batchId: code },
      data: {
        burned: true,
        burnTxHash,
        burnedAt: new Date(),
      },
    });
  }

  async createRoadmaps(
    batchId: string,
    action: "MINT" | "UPDATE" | "REVOKE",
    fromAddress: string,
    receivers: string[],
    txHash: string
  ): Promise<void> {
    if (receivers.length === 0) return;
    await (this.prisma as any).roadmap.createMany({
      data: receivers.map((toAddress, stepIndex) => ({
        batchId,
        fromAddress,
        toAddress,
        stepIndex,
        action,
        txHash,
      })),
    });
  }

  async listRoadmap(batchId: string): Promise<ProductRoadmapHop[]> {
    const prisma = this.prisma as any;
    const bid = (batchId || "").trim();
    if (!bid) return [];
    const rows = await prisma.roadmap.findMany({
      where: { batchId: bid },
      orderBy: { stepIndex: "asc" },
      select: { stepIndex: true, fromAddress: true, toAddress: true },
    });
    if (!Array.isArray(rows)) return [];
    return rows.map(
      (r: { stepIndex: number; fromAddress: string | null; toAddress: string | null }): ProductRoadmapHop => ({
        stepIndex: r.stepIndex,
        fromAddress: r.fromAddress,
        toAddress: r.toAddress,
      })
    );
  }
}

