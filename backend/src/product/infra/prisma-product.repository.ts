import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  MintBatchParams,
  ProductBatchListItem,
  ProductBatchSnapshot,
  ProductRepositoryPort,
  UpdateBatchParams,
<<<<<<< HEAD
  ProductRoadmapHop,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
} from "../domain/product.repository";

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listBatchesByMinter(
    profileId: number
  ): Promise<ProductBatchListItem[]> {
    const items = await (this.prisma as any).productBatch.findMany({
      where: { minterProfileId: profileId },
      select: {
        id: true,
        code: true,
        name: true,
<<<<<<< HEAD
        description: true,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
        image: true,
        createdAt: true,
        metadata: true,
        policyId: true,
      },
      orderBy: [{ createdAt: "asc" }, { code: "asc" }],
    });
    if (!Array.isArray(items)) return [];
    const visible = items.filter((b) => {
      const meta = b.metadata as Record<string, unknown> | null;
      const db = meta?._db as Record<string, unknown> | undefined;
      return !db || db.revoked !== true;
    });
    return visible.map(
      (b): ProductBatchListItem => ({
        id: b.id,
        code: b.code,
        name: b.name,
<<<<<<< HEAD
        description: b.description ?? null,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
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
<<<<<<< HEAD
      description,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
      image,
      standard,
      properties,
      metadata,
      mintTxHash,
      policyId,
      minterProfileId,
    } = params;
    await (this.prisma as any).productBatch.upsert({
      where: { code },
      create: {
        code,
        name,
<<<<<<< HEAD
        description,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
        image,
        standard,
        properties,
        metadata,
        mintTxHash,
        policyId: policyId ?? undefined,
        minterProfileId,
      },
      update: {
        mintTxHash,
        name,
<<<<<<< HEAD
        description,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
        image,
        standard,
        properties,
        metadata,
        policyId: policyId ?? undefined,
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
<<<<<<< HEAD
      description: batch.description ?? null,
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
      image: batch.image ?? null,
      standard: batch.standard ?? null,
      properties: batch.properties,
      metadata: batch.metadata,
    };
  }

  async updateBatch(params: UpdateBatchParams): Promise<void> {
<<<<<<< HEAD
    const { code, name, description, image, standard, properties, metadata } = params;
=======
    const { code, name, image, standard, properties, metadata } = params;
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        ...(name !== undefined && { name }),
<<<<<<< HEAD
        ...(description !== undefined && { description }),
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
        ...(image !== undefined && { image }),
        ...(standard !== undefined && { standard }),
        properties,
        metadata,
      },
    });
  }

  async markBatchRevoked(code: string, nextMetadata: object): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        metadata: nextMetadata,
      },
    });
  }

  async markBatchBurned(code: string, nextMetadata: object): Promise<void> {
    await (this.prisma as any).productBatch.update({
      where: { code },
      data: {
        metadata: nextMetadata,
      },
    });
  }

  async createRoadmaps(
    batchId: string,
    action: "MINT" | "UPDATE" | "REVOKE",
    receivers: string[],
    txHash: string
  ): Promise<void> {
    if (receivers.length === 0) return;
    await (this.prisma as any).roadmap.createMany({
      data: receivers.map((receiverAddress, hopIndex) => ({
        batchId,
        receiverAddress,
        hopIndex,
        action,
        txHash,
      })),
    });
  }
<<<<<<< HEAD

  async listRoadmap(batchId: string): Promise<ProductRoadmapHop[]> {
    const prisma = this.prisma as any;
    const bid = (batchId || "").trim();
    if (!bid) return [];
    const rows = await prisma.roadmap.findMany({
      where: { batchId: bid },
      orderBy: { hopIndex: "asc" },
      select: { hopIndex: true, receiverAddress: true },
    });
    if (!Array.isArray(rows)) return [];
    return rows.map(
      (r: { hopIndex: number; receiverAddress: string | null }): ProductRoadmapHop => ({
        hopIndex: r.hopIndex,
        receiverAddress: r.receiverAddress,
      })
    );
  }
=======
>>>>>>> 69ccb5ee5f7e43f7dd7814ed74c72c1ef60b05c8
}

