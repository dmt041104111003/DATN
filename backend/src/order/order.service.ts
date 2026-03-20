import { Injectable } from '@nestjs/common';
import { WarehouseService } from '../warehouse/warehouse.service';
import { ContractService } from '../contract/contract.service';
import { AssetService } from '../asset/asset.service';
import { PrismaService } from '../prisma/prisma.service';

export interface OrderCheckResult {
  inWarehouse: boolean;
  policyId?: string;
  assetName?: string;
  unit?: string;
  walletHasNft?: boolean;
  owners?: string[];
  message?: string;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
    private readonly contractService: ContractService,
    private readonly assetService: AssetService,
  ) {}

  async checkOrder(
    walletAddress: string,
    assetName: string,
  ): Promise<OrderCheckResult> {
    const name = (assetName || '').trim();
    if (!name) {
      return {
        inWarehouse: false,
        message: 'Asset name is required.',
      };
    }

    const asset = await this.warehouseService.findAssetByNameInWarehouses(
      walletAddress,
      name,
    );

    if (!asset) {
      return {
        inWarehouse: false,
        message: 'Asset not found in your warehouses.',
      };
    }

    let walletHasNft = false;
    try {
      walletHasNft = await this.contractService.checkWalletHasNft(
        walletAddress,
        asset.policyId,
        asset.assetName,
      );
    } catch (err) {
      return {
        inWarehouse: true,
        policyId: asset.policyId,
        assetName: asset.assetName,
        unit: asset.unit,
        walletHasNft: false,
        owners: String((asset as any).owners || '')
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        message: `Asset found in warehouse but on-chain check failed: ${err instanceof Error ? err.message : 'Unknown error'}.`,
      };
    }

    return {
      inWarehouse: true,
      policyId: asset.policyId,
      assetName: asset.assetName,
      unit: asset.unit,
      walletHasNft,
      owners: String((asset as any).owners || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean),
      message: walletHasNft
        ? 'Asset found in warehouse and wallet holds the NFT.'
        : 'Asset found in warehouse but wallet does not hold the NFT.',
    };
  }

  async clearAssetFromWarehouse(
    walletAddress: string,
    unit: string,
    options?: { status?: 'ACTIVE' | 'CONSUMED'; txHash?: string },
  ) {
    return this.assetService.clearWarehouseByUnit(unit, walletAddress, options);
  }

  async createShippedOrder(params: {
    senderWalletAddress: string;
    receiverWalletAddress: string;
    policyId: string;
    assetName: string;
    unit: string;
    txHash?: string | null;
  }) {
    return (this.prisma as any).order.create({
      data: {
        senderWalletAddress: params.senderWalletAddress,
        receiverWalletAddress: params.receiverWalletAddress,
        policyId: params.policyId,
        assetName: params.assetName,
        assetUnit: params.unit,
        txHash: params.txHash || null,
        status: 'SHIPPED',
      } as any,
    });
  }


  async ship(params: {
    senderWalletAddress: string;
    receiverWalletAddress: string;
    policyId: string;
    assetName: string;
    unit: string;
    txHash?: string | null;
  }) {
    const unit = (params.unit || '').trim();
    const receiver = (params.receiverWalletAddress || '').trim();
    if (!unit || !receiver) {
      return { success: false, message: 'unit and receiverWalletAddress are required' };
    }

    const asset = await (this.prisma as any).asset.findUnique({
      where: { unit },
      select: { unit: true, warehouseId: true },
    });
    if (!asset) {
      return { success: false, message: 'Asset not found' };
    }

    // Ensure the asset is currently inside one of sender's warehouses
    const warehouses = await (this.prisma as any).warehouse.findMany({
      where: { ownerWalletAddress: params.senderWalletAddress, isActive: true },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w: any) => w.id);
    if (!asset.warehouseId || !warehouseIds.includes(asset.warehouseId)) {
      return { success: false, message: 'Asset not found in your warehouses' };
    }

    await (this.prisma as any).asset.update({
      where: { unit },
      data: { warehouseId: null },
    });

    const order = await this.createShippedOrder({
      senderWalletAddress: params.senderWalletAddress,
      receiverWalletAddress: receiver,
      policyId: params.policyId,
      assetName: params.assetName,
      unit,
      txHash: params.txHash || null,
    });

    return { success: true, order };
  }

  async listSentOrders(senderWalletAddress: string) {
    return (this.prisma as any).order.findMany({
      where: { senderWalletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listIncomingOrders(receiverWalletAddress: string) {
    return (this.prisma as any).order.findMany({
      where: { receiverWalletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSentOrder(senderWalletAddress: string, orderId: string) {
    const id = (orderId || '').trim();
    const addr = (senderWalletAddress || '').trim();
    if (!id || !addr) {
      return { success: false, message: 'orderId and senderWalletAddress are required' };
    }
    const order = await (this.prisma as any).order.findUnique({
      where: { id },
      select: { id: true, senderWalletAddress: true },
    });
    if (!order || order.senderWalletAddress !== addr) {
      return { success: false, message: 'Order not found' };
    }
    await (this.prisma as any).order.delete({ where: { id } });
    return { success: true };
  }

  async deleteIncomingOrder(receiverWalletAddress: string, orderId: string) {
    const id = (orderId || '').trim();
    const addr = (receiverWalletAddress || '').trim();
    if (!id || !addr) {
      return { success: false, message: 'orderId and receiverWalletAddress are required' };
    }
    const order = await (this.prisma as any).order.findUnique({
      where: { id },
      select: { id: true, receiverWalletAddress: true },
    });
    if (!order || order.receiverWalletAddress !== addr) {
      return { success: false, message: 'Order not found' };
    }
    await (this.prisma as any).order.delete({ where: { id } });
    return { success: true };
  }

  async confirmReceive(params: {
    receiverWalletAddress: string;
    orderId: string;
    warehouseId: string;
  }) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: params.orderId },
    });
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    if (order.receiverWalletAddress !== params.receiverWalletAddress) {
      return { success: false, message: 'Order not found' };
    }
    if (order.status !== 'SHIPPED') {
      return { success: false, message: 'Order is not shippable' };
    }

    const warehouse = await (this.prisma as any).warehouse.findUnique({
      where: { id: params.warehouseId },
      select: { id: true, ownerWalletAddress: true, isActive: true, maxAssets: true },
    });
    if (!warehouse || !warehouse.isActive) {
      return { success: false, message: 'Warehouse not found' };
    }
    if (warehouse.ownerWalletAddress !== params.receiverWalletAddress) {
      return { success: false, message: 'Warehouse not found' };
    }

    if (typeof warehouse.maxAssets === 'number' && warehouse.maxAssets > 0) {
      const currentCount = await (this.prisma as any).asset.count({
        where: { warehouseId: warehouse.id },
      });
      if (currentCount >= warehouse.maxAssets) {
        return { success: false, message: 'Warehouse capacity reached' };
      }
    }

    const asset = await (this.prisma as any).asset.findUnique({
      where: { unit: order.assetUnit },
      select: { unit: true },
    });
    if (!asset) {
      return { success: false, message: 'Asset not found' };
    }

    await (this.prisma as any).asset.update({
      where: { unit: order.assetUnit },
      data: {
        warehouseId: params.warehouseId,
        ownerWalletAddress: params.receiverWalletAddress,
      },
    });

    const updated = await (this.prisma as any).order.update({
      where: { id: order.id },
      data: {
        status: 'RECEIVED',
        receiverWarehouseId: params.warehouseId,
      } as any,
    });

    return { success: true, order: updated };
  }

  async getOwnersForOrder(params: {
    receiverWalletAddress: string;
    orderId: string;
  }): Promise<{ success: boolean; owners?: string[]; message?: string }> {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: params.orderId },
    });
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    if (order.receiverWalletAddress !== params.receiverWalletAddress) {
      return { success: false, message: 'Order not found' };
    }

    const asset = await (this.prisma as any).asset.findUnique({
      where: { unit: order.assetUnit },
      select: { owners: true },
    });
    if (!asset) {
      return { success: false, message: 'Asset not found' };
    }

    const owners = String(asset.owners || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (owners.length === 0) {
      return { success: false, message: 'Owners not found for this asset' };
    }

    return { success: true, owners };
  }
}
