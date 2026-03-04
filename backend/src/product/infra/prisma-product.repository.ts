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
        code: true,
        name: true,
        description: true,
        image: true,
        createdAt: true,
        policyId: true,
      },
      orderBy: [{ createdAt: "asc" }, { code: "asc" }],
    });
    if (!Array.isArray(items)) return [];
    return items.map(
      (b): ProductBatchListItem => ({
        id: b.id,
        code: b.code,
        name: b.name,
        description: b.description ?? null,
        image: b.image ?? null,
        createdAt: b.createdAt,
        policyId: b.policyId ?? null,
      })
    );
  }

  async upsertBatchOnMint(params: MintBatchParams): Promise<void> {
    const {
      code,
      name,
      description,
      image,
      standard,
      mintTxHash,
      policyId,
      minterProfileId,
      expiryDate,
    } = params;
    await (this.prisma as any).productBatch.upsert({
      where: { code },
      create: {
        code,
        name,
        description,
        image,
        standard,
        mintTxHash,
        policyId: policyId ?? undefined,
        minterProfileId,
        ...(expiryDate !== undefined && { expiryDate }),
      },
      update: {
        mintTxHash,
        name,
        description,
        image,
        standard,
        policyId: policyId ?? undefined,
        ...(expiryDate !== undefined && { expiryDate }),
      },
    });
  }

  async findBatchByCode(code: string): Promise<ProductBatchSnapshot | null> {
    const batch = await (this.prisma as any).productBatch.findUnique({
      where: { code },
    });
    if (!batch) return null;
    return {
      code: batch.code,
      name: batch.name,
      description: batch.description ?? null,
      image: batch.image ?? null,
      standard: batch.standard ?? null,
      policyId: batch.policyId ?? null,
      expiryDate: batch.expiryDate ?? null,
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
      where: { code },
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
      code,
      name,
      description,
      image,
      standard,
      expiryDate,
      lastUpdateTxHash,
      lastUpdateAt,
    } = params;
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(standard !== undefined && { standard }),
        ...(expiryDate !== undefined && { expiryDate }),
        ...(lastUpdateTxHash !== undefined && { lastUpdateTxHash }),
        ...(lastUpdateAt !== undefined && { lastUpdateAt }),
      },
    });
  }

  async markBatchRevoked(code: string): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        revoked: true,
        revokeTxHash: undefined,
        revokedAt: new Date(),
      },
    });
  }

  async markBatchBurned(code: string): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        burned: true,
        burnTxHash: undefined,
        burnedAt: new Date(),
      },
    });
  }

  async createRoadmaps(
    batchId: string,
    action: "MINT" | "UPDATE" | "REVOKE",
    senderAddress: string,
    receivers: string[],
    txHash: string
  ): Promise<void> {
    if (receivers.length === 0) return;
    await (this.prisma as any).roadmap.createMany({
      data: receivers.map((receiverAddress, hopIndex) => ({
        batchId,
        senderAddress,
        receiverAddress,
        hopIndex,
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
      orderBy: { hopIndex: "asc" },
      select: { hopIndex: true, senderAddress: true, receiverAddress: true },
    });
    if (!Array.isArray(rows)) return [];
    return rows.map(
      (r: { hopIndex: number; senderAddress: string | null; receiverAddress: string | null }): ProductRoadmapHop => ({
        hopIndex: r.hopIndex,
        senderAddress: r.senderAddress,
        receiverAddress: r.receiverAddress,
      })
    );
  }
}

