import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contractService: ContractService,
  ) {}

  async list(ownerWalletAddress: string) {
    const warehouses = await (this.prisma as any).warehouse.findMany({
      where: { isActive: true, ownerWalletAddress },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { assets: true } } },
    });
    return warehouses.map((w: any) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      ownerWalletAddress: w.ownerWalletAddress,
      isActive: w.isActive,
      maxAssets: w.maxAssets,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      assetCount: w._count?.assets ?? 0,
    }));
  }

  async create(
    data: { code: string; name: string; maxAssets?: number | null },
    ownerWalletAddress: string,
  ) {
    const code = (data.code || '').trim();
    const name = (data.name || '').trim();
    if (!code || !name) {
      throw new BadRequestException('Code and name are required');
    }
    if (!ownerWalletAddress) {
      throw new BadRequestException('Owner wallet address is required');
    }

    const maxAssets =
      typeof data.maxAssets === 'number' && data.maxAssets > 0
        ? Math.floor(data.maxAssets)
        : null;

    try {
      return await (this.prisma as any).warehouse.create({
        data: { code, name, ownerWalletAddress, maxAssets },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(
          'Warehouse code already exists. Please choose another code.',
        );
      }
      throw err;
    }
  }

  async update(
    id: string,
    ownerWalletAddress: string,
    data: { name?: string; isActive?: boolean; maxAssets?: number | null },
  ) {
    const existing = await (this.prisma as any).warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }
    if (existing.ownerWalletAddress !== ownerWalletAddress) {
      throw new NotFoundException('Warehouse not found');
    }

    const updateData: any = {};
    if (typeof data.name === 'string') updateData.name = data.name.trim();
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;
    if (data.maxAssets !== undefined) {
      updateData.maxAssets =
        typeof data.maxAssets === 'number' && data.maxAssets > 0
          ? Math.floor(data.maxAssets)
          : null;
    }

    return (this.prisma as any).warehouse.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, ownerWalletAddress: string) {
    const existing = await (this.prisma as any).warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }
    if (existing.ownerWalletAddress !== ownerWalletAddress) {
      throw new NotFoundException('Warehouse not found');
    }

    await (this.prisma as any).warehouse.delete({ where: { id } });
    return { success: true };
  }

  async getAssets(warehouseId: string, ownerWalletAddress: string) {
    const warehouse = await (this.prisma as any).warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    if (warehouse.ownerWalletAddress !== ownerWalletAddress) {
      throw new NotFoundException('Warehouse not found');
    }

    const assets = await (this.prisma as any).asset.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset: any) => ({
      id: asset.id,
      policyId: asset.policyId,
      assetName: asset.assetName,
      unit: asset.unit,
      txHash: asset.txHash,
      owners: asset.owners ? asset.owners.split('\n').filter((o: string) => o.trim().length > 0) : [],
      name: asset.name,
      description: asset.description,
      brand: asset.brand,
      model: asset.model,
      material: asset.material,
      notes: asset.notes,
      battery: asset.battery,
      image: asset.image,
      mediaType: asset.mediaType,
      roadmap: asset.roadmap,
      location: asset.location,
      quantity: asset.quantity,
      quantityUnit: asset.quantityUnit,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));
  }

  async findAssetByNameInWarehouses(
    ownerWalletAddress: string,
    assetName: string,
  ): Promise<
    | { policyId: string; assetName: string; unit: string; owners: string }
    | null
  > {
    const name = (assetName || '').trim();
    if (!name) return null;

    const warehouses = await (this.prisma as any).warehouse.findMany({
      where: { isActive: true, ownerWalletAddress },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w: any) => w.id);
    if (warehouseIds.length === 0) return null;

    const asset = await (this.prisma as any).asset.findFirst({
      where: {
        warehouseId: { in: warehouseIds },
        assetName: name,
      },
      select: { policyId: true, assetName: true, unit: true, owners: true },
    });
    return asset
      ? {
          policyId: asset.policyId,
          assetName: asset.assetName,
          unit: asset.unit,
          owners: asset.owners,
        }
      : null;
  }

  async buildBurnToken222InWarehouse(params: {
    warehouseId: string;
    walletAddress: string;
    roleCode: string;
    unit: string;
  }) {
    const role = (params.roleCode || '').trim().toUpperCase();
    if (role !== 'AGENT') {
      throw new BadRequestException('Only AGENT can burn token 222 in warehouse flow');
    }

    const warehouse = await (this.prisma as any).warehouse.findUnique({
      where: { id: params.warehouseId },
      select: { id: true, ownerWalletAddress: true, isActive: true },
    });
    if (!warehouse || !warehouse.isActive) {
      throw new NotFoundException('Warehouse not found');
    }
    if (warehouse.ownerWalletAddress !== params.walletAddress) {
      throw new NotFoundException('Warehouse not found');
    }

    const asset = await (this.prisma as any).asset.findFirst({
      where: { unit: params.unit, warehouseId: params.warehouseId },
      select: { unit: true, assetName: true, owners: true },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found in warehouse');
    }

    const owners = String(asset.owners || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (owners.length === 0) {
      throw new BadRequestException('Owners not found for this asset');
    }
    if (!owners.includes(params.walletAddress)) {
      throw new BadRequestException('Wallet is not in script owners list');
    }

    const tx = await this.contractService.createBurn222(
      params.walletAddress,
      owners,
      [{ assetName: asset.assetName }],
    );
    return {
      ...tx,
      burnType: 'CONSUMED',
      token: '222',
      warehouseId: params.warehouseId,
      unit: asset.unit,
      assetName: asset.assetName,
    };
  }
}

