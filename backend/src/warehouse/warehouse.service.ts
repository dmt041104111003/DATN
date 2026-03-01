import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyWarehouseInventory(profileId: number): Promise<
    { batchId: string; batchName: string; image: string | null; quantity: number; mintedAt: Date; policyId: string | null; status: string }[]
  > {
    const prisma = this.prisma as any;
    const rows = await prisma.warehouseInventory.findMany({
      where: { profileId },
      include: { batch: { select: { id: true, name: true, image: true, policyId: true } } },
      orderBy: { mintedAt: "desc" },
    });
    return (rows || []).map((inv: any) => ({
      batchId: inv.batchId,
      batchName: inv.batch?.name ?? inv.batchId,
      image: inv.batch?.image ?? null,
      quantity: inv.quantity ?? 1,
      mintedAt: inv.mintedAt,
      policyId: inv.batch?.policyId ?? null,
      status: inv.status ?? "IN_WAREHOUSE",
    }));
  }

  async removeOneFromWarehouse(profileId: number, batchId: string): Promise<void> {
    const prisma = this.prisma as any;
    await prisma.warehouseInventory.deleteMany({
      where: { batchId, profileId },
    });
  }

  async markAsShipped(profileId: number, batchId: string): Promise<void> {
    const prisma = this.prisma as any;
    await prisma.warehouseInventory.updateMany({
      where: { batchId, profileId },
      data: { status: "SHIPPED" },
    });
  }

  async addToWarehouse(profileId: number, batchId: string): Promise<void> {
    const prisma = this.prisma as any;
    await prisma.warehouseInventory.upsert({
      where: { batchId_profileId: { batchId, profileId } },
      create: { batchId, profileId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });
  }

  async getRecipientByRoadmap(profileId: number, batchId: string): Promise<{ recipientAddress: string | null }> {
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
      where: { id: bid },
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
        orderBy: { hopIndex: "asc" },
        select: { receiverAddress: true },
      });
      return {
        recipientAddress: firstHop?.receiverAddress?.trim() ?? null,
      };
    }

    const myHop = await prisma.roadmap.findMany({
      where: { batchId: bid },
      orderBy: { hopIndex: "asc" },
      select: { hopIndex: true, receiverAddress: true },
    });
    const idx = myHop.findIndex(
      (r: { hopIndex: number; receiverAddress: string | null }) =>
        (r.receiverAddress || "").trim().toLowerCase() === senderWallet,
    );
    if (idx < 0 || idx >= myHop.length - 1) return { recipientAddress: null };
    const next = myHop[idx + 1]?.receiverAddress?.trim() ?? null;
    return { recipientAddress: next };
  }
}
