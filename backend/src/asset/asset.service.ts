import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contractService: ContractService,
  ) {}

  async create(data: {
    policyId: string;
    assetName: string;
    unit: string;
    txHash: string;
    owners: string[];
    ownerWalletAddress: string;
    warehouseId?: string | null;
    metadata: {
      name: string;
      description: string;
      brand?: string;
      model?: string;
      material?: string;
      notes?: string;
      battery?: string;
      image?: string;
      mediaType?: string;
      roadmap?: string;
      location?: string;
      quantity?: string;
      unit?: string;
    };
  }) {
    const warehouseId = (data.warehouseId || '').trim() || null;
    if (warehouseId) {
      const wh = await (this.prisma as any).warehouse.findUnique({
        where: { id: warehouseId },
        select: { id: true, ownerWalletAddress: true, isActive: true, maxAssets: true },
      });
      if (!wh || !wh.isActive) {
        throw new BadRequestException('Warehouse not found');
      }
      if (wh.ownerWalletAddress !== data.ownerWalletAddress) {
        throw new BadRequestException('Warehouse not found');
      }
      if (typeof wh.maxAssets === 'number' && wh.maxAssets > 0) {
        const currentCount = await (this.prisma as any).asset.count({
          where: { warehouseId: wh.id },
        });
        if (currentCount >= wh.maxAssets) {
          throw new ConflictException('Warehouse capacity reached');
        }
      }
    }

    const asset = await (this.prisma.asset as any).create({
      data: {
        policyId: data.policyId,
        assetName: data.assetName,
        unit: data.unit,
        txHash: data.txHash,
        owners: data.owners.join('\n'),
        warehouseId,
        ownerWalletAddress: data.ownerWalletAddress,
        name: data.metadata.name,
        description: data.metadata.description,
        status: 'ACTIVE',
        brand: data.metadata.brand,
        model: data.metadata.model,
        material: data.metadata.material,
        notes: data.metadata.notes,
        battery: data.metadata.battery,
        image: data.metadata.image,
        mediaType: data.metadata.mediaType,
        roadmap: data.metadata.roadmap,
        location: data.metadata.location,
        quantity: data.metadata.quantity ?? "",
        quantityUnit: data.metadata.unit ?? "",
      },
    });

    return {
      id: asset.id,
      policyId: asset.policyId,
      assetName: asset.assetName,
      unit: asset.unit,
      txHash: asset.txHash,
    };
  }

  async findAll(ownerAddress?: string) {
    const where = ownerAddress
      ? {
          ownerWalletAddress: ownerAddress,
        }
      : undefined;

    const assets = await (this.prisma.asset as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => ({
      id: asset.id,
      policyId: asset.policyId,
      assetName: asset.assetName,
      unit: asset.unit,
      txHash: asset.txHash,
      owners: asset.owners.split('\n').filter((o) => o.trim().length > 0),
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
      status: asset.status,
    }));
  }

  async updateByUnit(
    unit: string,
    walletAddress: string,
    data: {
      txHash: string;
      owners?: string[];
      metadata?: {
        name?: string;
        description?: string;
        brand?: string;
        model?: string;
        material?: string;
        notes?: string;
        battery?: string;
        image?: string;
        mediaType?: string;
        roadmap?: string;
        location?: string;
        quantity?: string;
        unit?: string;
      };
    },
  ) {
    const trimmedUnit = (unit || '').trim();
    const trimmedWallet = (walletAddress || '').trim();

    if (!trimmedUnit || !trimmedWallet) {
      return { success: false, message: 'unit and walletAddress are required' };
    }

    const existing = await (this.prisma.asset as any).findUnique({
      where: { unit: trimmedUnit },
      select: {
        unit: true,
        ownerWalletAddress: true,
        owners: true,
      },
    });

    if (!existing) {
      return { success: false, message: 'Asset not found' };
    }

    const owners = String(existing.owners || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const isOwner =
      existing.ownerWalletAddress === trimmedWallet || owners.includes(trimmedWallet);

    if (!isOwner) {
      return { success: false, message: 'Not allowed' };
    }

    const updateData: any = {
      txHash: data.txHash,
    };

    if (data.owners) {
      updateData.owners = data.owners.join('\n');
    }

    if (data.metadata) {
      if (typeof data.metadata.name !== 'undefined') updateData.name = data.metadata.name;
      if (typeof data.metadata.description !== 'undefined') updateData.description = data.metadata.description;
      if (typeof data.metadata.brand !== 'undefined') updateData.brand = data.metadata.brand;
      if (typeof data.metadata.model !== 'undefined') updateData.model = data.metadata.model;
      if (typeof data.metadata.material !== 'undefined') updateData.material = data.metadata.material;
      if (typeof data.metadata.notes !== 'undefined') updateData.notes = data.metadata.notes;
      if (typeof data.metadata.battery !== 'undefined') updateData.battery = data.metadata.battery;
      if (typeof data.metadata.image !== 'undefined') updateData.image = data.metadata.image;
      if (typeof data.metadata.mediaType !== 'undefined') updateData.mediaType = data.metadata.mediaType;
      if (typeof data.metadata.roadmap !== 'undefined') updateData.roadmap = data.metadata.roadmap;
      if (typeof data.metadata.location !== 'undefined') updateData.location = data.metadata.location;
      if (typeof data.metadata.quantity !== 'undefined')
        updateData.quantity = data.metadata.quantity ?? "";
      if (typeof data.metadata.unit !== 'undefined')
        updateData.quantityUnit = data.metadata.unit ?? "";
    }

    await (this.prisma.asset as any).update({
      where: { unit: trimmedUnit },
      data: updateData,
    });

    return { success: true, unit: trimmedUnit };
  }

  async updateLocationByUnit(params: {
    unit: string;
    walletAddress: string;
    location: string;
    txHash: string;
  }) {
    const unit = (params.unit || '').trim();
    const walletAddress = (params.walletAddress || '').trim();
    const location = (params.location || '').trim();
    const txHash = (params.txHash || '').trim();

    if (!unit || !walletAddress || !location || !txHash) {
      return { success: false, message: 'unit, walletAddress, location, and txHash are required' };
    }

    const asset = await (this.prisma.asset as any).findUnique({
      where: { unit },
      select: { unit: true, owners: true, policyId: true, assetName: true },
    });
    if (!asset) {
      return { success: false, message: 'Asset not found' };
    }

    const owners = String(asset.owners || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (!owners.includes(walletAddress)) {
      return { success: false, message: 'Not allowed' };
    }

    const walletHasNft = await this.contractService.checkWalletHasNft(
      walletAddress,
      asset.policyId,
      asset.assetName,
    );
    if (!walletHasNft) {
      return { success: false, message: 'Wallet does not hold the NFT' };
    }

    await (this.prisma.asset as any).update({
      where: { unit },
      data: { location, txHash },
    });

    return { success: true, unit, location };
  }

  async deleteByUnit(unit: string, walletAddress: string) {
    const trimmedUnit = (unit || '').trim();
    const trimmedWallet = (walletAddress || '').trim();

    if (!trimmedUnit || !trimmedWallet) {
      return { success: false, message: 'unit and walletAddress are required' };
    }

    const existing = await (this.prisma.asset as any).findUnique({
      where: { unit: trimmedUnit },
      select: {
        unit: true,
        ownerWalletAddress: true,
        owners: true,
      },
    });

    if (!existing) {
      return { success: false, message: 'Asset not found' };
    }

    const owners = String(existing.owners || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const isOwner =
      existing.ownerWalletAddress === trimmedWallet || owners.includes(trimmedWallet);

    if (!isOwner) {
      return { success: false, message: 'Not allowed' };
    }

    await this.prisma.asset.delete({
      where: { unit: trimmedUnit },
    });

    return { success: true, unit: trimmedUnit };
  }

  async clearWarehouseByUnit(
    unit: string,
    ownerWalletAddress: string,
    options?: { status?: 'ACTIVE' | 'CONSUMED'; txHash?: string },
  ) {
    const existing = await (this.prisma.asset as any).findUnique({
      where: { unit },
      select: { unit: true, ownerWalletAddress: true, warehouseId: true },
    });
    if (!existing) {
      return { success: false, message: 'Asset not found' };
    }
    if (existing.ownerWalletAddress !== ownerWalletAddress) {
      return { success: false, message: 'Asset not found' };
    }

    const updateData: any = { warehouseId: null };
    if (options?.status) {
      updateData.status = options.status;
    }
    if (typeof options?.txHash === 'string' && options.txHash.trim()) {
      updateData.txHash = options.txHash.trim();
    }

    await (this.prisma.asset as any).update({
      where: { unit },
      data: updateData,
    });

    return { success: true, unit, previousWarehouseId: existing.warehouseId ?? null };
  }
}

