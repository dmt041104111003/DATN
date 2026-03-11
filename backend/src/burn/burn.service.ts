import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { ContractService } from '../contract/contract.service';
import { AssetService } from '../asset/asset.service';

export interface BurnCheckResult {
  inWarehouse: boolean;
  policyId?: string;
  assetName?: string;
  unit?: string;
  walletHasNft?: boolean;
  message?: string;
}

@Injectable()
export class BurnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
    private readonly contractService: ContractService,
    private readonly assetService: AssetService,
  ) {}

  async checkBurn(
    walletAddress: string,
    assetName: string,
  ): Promise<BurnCheckResult> {
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
        message: `Asset found in warehouse but on-chain check failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }.`,
      };
    }

    return {
      inWarehouse: true,
      policyId: asset.policyId,
      assetName: asset.assetName,
      unit: asset.unit,
      walletHasNft,
      message: walletHasNft
        ? 'Asset found in warehouse and wallet holds the NFT.'
        : 'Asset found in warehouse but wallet does not hold the NFT.',
    };
  }

  async recordBurn(params: {
    walletAddress: string;
    policyId: string;
    assetName: string;
    unit: string;
    txHash: string;
  }) {
    const unit = (params.unit || '').trim();
    const walletAddress = (params.walletAddress || '').trim();
    const policyId = (params.policyId || '').trim();
    const assetName = (params.assetName || '').trim();
    const txHash = (params.txHash || '').trim();

    if (!unit || !walletAddress || !policyId || !assetName || !txHash) {
      return { success: false, message: 'Missing fields' };
    }

    // Clear from warehouse if it still exists there
    await this.assetService.clearWarehouseByUnit(unit, walletAddress).catch(() => null);

    const burn = await (this.prisma as any).burnRecord.create({
      data: {
        assetUnit: unit,
        policyId,
        assetName,
        burnerWalletAddress: walletAddress,
        txHash,
      },
    });

    return { success: true, burn };
  }

  async listBurns(walletAddress: string) {
    return (this.prisma as any).burnRecord.findMany({
      where: { burnerWalletAddress: walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOwnersForUnit(params: { walletAddress: string; unit: string }) {
    const addr = (params.walletAddress || '').trim();
    const unit = (params.unit || '').trim();
    if (!addr || !unit) {
      return { success: false, message: 'walletAddress and unit are required' };
    }

    const warehouses = await (this.prisma as any).warehouse.findMany({
      where: { ownerWalletAddress: addr, isActive: true },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w: any) => w.id);
    if (warehouseIds.length === 0) {
      return { success: false, message: 'Asset not found in your warehouses' };
    }

    const asset = await (this.prisma as any).asset.findFirst({
      where: { unit, warehouseId: { in: warehouseIds } },
      select: { owners: true },
    });
    if (!asset) {
      return { success: false, message: 'Asset not found in your warehouses' };
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

