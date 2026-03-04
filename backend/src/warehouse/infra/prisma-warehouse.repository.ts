import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  RecipientByRoadmapResult,
  WarehouseInventoryItem,
  WarehouseRepositoryPort,
} from "../domain/warehouse.repository";

@Injectable()
export class PrismaWarehouseRepository implements WarehouseRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listInventoryByProfileId(
    profileId: number
  ): Promise<WarehouseInventoryItem[]> {
    const rows = await (this.prisma as any).warehouseInventory.findMany({
      where: { profileId },
      include: {
        batch: {
          select: { id: true, name: true, image: true, policyId: true },
        },
      },
      orderBy: { receivedAt: "desc" },
    });
    const visible = (rows || []).filter(
      (inv: any) => String(inv?.status ?? "IN_WAREHOUSE") !== "BURNED"
    );
    return visible.map(
      (inv: any): WarehouseInventoryItem => ({
        batchId: inv.batchId,
        batchName: inv.batch?.name ?? inv.batchId,
        image: inv.batch?.image ?? null,
        receivedAt: inv.receivedAt,
        outAt: inv.shippedAt ?? inv.consumedAt ?? null,
        policyId: inv.batch?.policyId ?? null,
        status: inv.status ?? "IN_WAREHOUSE",
      })
    );
  }

  async removeInventoryForProfile(
    profileId: number,
    batchId: string
  ): Promise<void> {
    await (this.prisma as any).warehouseInventory.deleteMany({
      where: { batchId, profileId },
    });
  }

  async markAsShippedForProfile(
    profileId: number,
    batchId: string
  ): Promise<void> {
    await (this.prisma as any).warehouseInventory.updateMany({
      where: { batchId, profileId },
      data: { status: "ON_WAY", shippedAt: new Date(), lastMovedAt: new Date() },
    });
  }

  async markAsBurnedForProfile(
    profileId: number,
    batchId: string,
    burnTxHash?: string
  ): Promise<void> {
    await (this.prisma as any).warehouseInventory.updateMany({
      where: { batchId, profileId },
      data: {
        status: "CONSUMED",
        consumedAt: new Date(),
        burnTxHash: burnTxHash ?? null,
        lastMovedAt: new Date(),
      },
    });
  }

  async addToWarehouseForProfile(
    profileId: number,
    batchId: string
  ): Promise<void> {
    await (this.prisma as any).warehouseInventory.upsert({
      where: { batchId_profileId: { batchId, profileId } },
      create: { batchId, profileId, status: "IN_WAREHOUSE" },
      update: { status: "IN_WAREHOUSE", shippedAt: null, lastMovedAt: new Date() },
    });
  }

  async findRecipientByRoadmap(
    profileId: number,
    batchId: string
  ): Promise<RecipientByRoadmapResult> {
    const prisma = this.prisma as any;
    const bid = (batchId || "").trim();
    if (!bid) return { recipientAddress: null };

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { walletAddress: true },
    });
    if (!profile?.walletAddress) return { recipientAddress: null };
    const senderWallet = profile.walletAddress.trim().toLowerCase();

    const batch = await prisma.productBatch.findUnique({
      where: { batchId: bid },
      select: {
        minterProfileId: true,
        minterProfile: { select: { walletAddress: true } },
      },
    });
    if (!batch) return { recipientAddress: null };

    const minterWallet =
      batch.minterProfile?.walletAddress?.trim().toLowerCase() ?? "";

    if (minterWallet && senderWallet === minterWallet) {
      const firstHop = await prisma.roadmap.findFirst({
        where: { batchId: bid },
        orderBy: { stepIndex: "asc" },
        select: { toAddress: true },
      });
      return {
        recipientAddress: firstHop?.toAddress?.trim() ?? null,
      };
    }

    const myHop = await prisma.roadmap.findMany({
      where: { batchId: bid },
      orderBy: { stepIndex: "asc" },
      select: { stepIndex: true, toAddress: true },
    });
    const idx = myHop.findIndex(
      (r: { stepIndex: number; toAddress: string | null }) =>
        (r.toAddress || "").trim().toLowerCase() === senderWallet,
    );
    if (idx < 0 || idx >= myHop.length - 1)
      return { recipientAddress: null };
    const next = myHop[idx + 1]?.toAddress?.trim() ?? null;
    return { recipientAddress: next };
  }
}

