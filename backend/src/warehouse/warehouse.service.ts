import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductContractService } from '../product/product.contract.service';

function normAddr(s: string): string {
  return (s || '').trim().toLowerCase();
}

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productContractService: ProductContractService,
  ) {}

  async list(siteCustodianAddress: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true, siteCustodianAddress },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { containers: true } } },
    });
    return warehouses.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      ownerWalletAddress: w.siteCustodianAddress,
      siteCustodianAddress: w.siteCustodianAddress,
      isActive: w.isActive,
      maxProducts: w.maxProducts,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      productCount: (w as any)._count?.containers ?? 0,
    }));
  }

  async create(
    data: { code: string; name: string; maxProducts?: number | null },
    siteCustodianAddress: string,
  ) {
    const code = (data.code || '').trim();
    const name = (data.name || '').trim();
    if (!code || !name) {
      throw new BadRequestException('Facility reference and site name are required.');
    }
    if (!siteCustodianAddress) {
      throw new BadRequestException('Operator account reference is required.');
    }

    const maxProducts =
      typeof data.maxProducts === 'number' && data.maxProducts > 0
        ? Math.floor(data.maxProducts)
        : null;

    try {
      return await this.prisma.warehouse.create({
        data: { code, name, siteCustodianAddress, maxProducts },
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
    siteCustodianAddress: string,
    data: { name?: string; isActive?: boolean; maxProducts?: number | null },
  ) {
    const existing = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }
    if (existing.siteCustodianAddress !== siteCustodianAddress) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }

    const updateData: {
      name?: string;
      isActive?: boolean;
      maxProducts?: number | null;
    } = {};
    if (typeof data.name === 'string') updateData.name = data.name.trim();
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;
    if (data.maxProducts !== undefined) {
      updateData.maxProducts =
        typeof data.maxProducts === 'number' && data.maxProducts > 0
          ? Math.floor(data.maxProducts)
          : null;
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, siteCustodianAddress: string) {
    const existing = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }
    if (existing.siteCustodianAddress !== siteCustodianAddress) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }

    const productsCount = await (this.prisma as any).container.count({
      where: { warehouseId: id },
    });
    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot remove this warehouse because it still contains staged lots.',
      );
    }

    await this.prisma.warehouse.delete({ where: { id } });
    return { success: true };
  }

  async getProducts(warehouseId: string, siteCustodianAddress: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }
    if (warehouse.siteCustodianAddress !== siteCustodianAddress) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }

    const products = await (this.prisma as any).container.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
    });

    const keys = products.map((p) => String(p.inventoryKey || '').trim()).filter(Boolean);
    const pendingByKey: Record<string, boolean> = {};
    if (keys.length > 0) {
      try {
        const pending = await (this.prisma as any).recordOperation.findMany({
          where: { entityType: 'CONTAINER', entityKey: { in: keys }, verified: false },
          select: { entityKey: true },
        });
        for (const row of Array.isArray(pending) ? pending : []) {
          const k = String(row?.entityKey || '').trim();
          if (k) pendingByKey[k] = true;
        }
      } catch {
        // ignore
      }
    }

    return products.map((product) => {
      const key = String(product.inventoryKey || '').trim();
      const pending = Boolean(pendingByKey[key]);
      return {
      id: product.id,
      traceSchemeRef: product.traceSchemeRef,
      lotReference: product.lotReference,
      inventoryKey: product.inventoryKey,
      confirmationRef: product.confirmationRef,
      custodyParties: product.custodyRoster
        ? product.custodyRoster.split('\n').filter((o: string) => o.trim().length > 0)
        : [],
      name: product.tradeTitle,
      description: product.lotStory,
      roadmap: product.roadmap,
      location: product.location,
      containerType: (product as any).containerType ?? null,
      maxWeightValue: (product as any).maxWeightValue ?? null,
      maxWeightUnit: (product as any).maxWeightUnit ?? null,
      maxVolumeValue: (product as any).maxVolumeValue ?? null,
      maxVolumeUnit: (product as any).maxVolumeUnit ?? null,
      verified: !pending,
      hasPending: pending,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      };
    });
  }

  async findProductByNameInWarehouses(
    siteCustodianAddress: string,
    lotReference: string,
  ): Promise<
    | { traceSchemeRef: string; lotReference: string; inventoryKey: string; custodyRoster: string }
    | null
  > {
    const name = (lotReference || '').trim();
    if (!name) return null;

    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true, siteCustodianAddress },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w) => w.id);
    if (warehouseIds.length === 0) return null;

    const product = await (this.prisma as any).container.findFirst({
      where: {
        warehouseId: { in: warehouseIds },
        lotReference: name,
      },
      select: {
        traceSchemeRef: true,
        lotReference: true,
        inventoryKey: true,
        custodyRoster: true,
      },
    });
    return product
      ? {
          traceSchemeRef: product.traceSchemeRef,
          lotReference: product.lotReference,
          inventoryKey: product.inventoryKey,
          custodyRoster: product.custodyRoster,
        }
      : null;
  }

  async finalizeOutboundHandoffInWarehouse(params: {
    warehouseId: string;
    walletAddress: string;
    roleCode: string;
    unit: string;
  }) {
    const role = (params.roleCode || '').trim().toUpperCase();
    if (role !== 'AGENT' && role !== 'TRANSIT') {
      throw new BadRequestException(
        'Only field logistics or transit roles may finalize an outbound handoff from the warehouse.',
      );
    }

    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: params.warehouseId },
      select: { id: true, siteCustodianAddress: true, isActive: true },
    });
    if (!warehouse || !warehouse.isActive) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }
    if (warehouse.siteCustodianAddress !== params.walletAddress) {
      throw new NotFoundException('Storage warehouse not found or access denied.');
    }

    const product = await (this.prisma as any).container.findFirst({
      where: { inventoryKey: params.unit, warehouseId: params.warehouseId },
      select: {
        inventoryKey: true,
        lotReference: true,
        custodyRoster: true,
        status: true,
      },
    });
    if (!product) {
      throw new NotFoundException(
        'No agri traceability lot with this unit is on hand at this warehouse.',
      );
    }

    const pending = await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: 'CONTAINER', entityKey: params.unit, verified: false },
      select: { id: true },
    });
    if (pending) {
      throw new BadRequestException(
        'Public record check is still pending. Please wait for verification before dispatch.',
      );
    }

    if (String(product.status) === 'OUTBOUND_DISPATCH') {
      throw new BadRequestException(
        'This lot was already recorded as dispatched from warehouse; consumption is not allowed.',
      );
    }
    if (product.status === 'CONSUMED') {
      throw new BadRequestException(
        'This lot is already marked fully consumed.',
      );
    }

    const roster = String(product.custodyRoster || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (roster.length === 0) {
      throw new BadRequestException('Joint custody roster missing for this lot.');
    }
    const walletNorm = normAddr(params.walletAddress);
    const rosterNorm = roster.map(normAddr);
    if (!rosterNorm.includes(walletNorm)) {
      throw new BadRequestException(
        'This account is not on the joint custody roster for this lot.',
      );
    }
    const lastOwner = rosterNorm[rosterNorm.length - 1] || '';
    if (!lastOwner || lastOwner !== walletNorm) {
      throw new BadRequestException(
        'Only the last custody address may finalize consumption for this lot.',
      );
    }

    const tx = await this.productContractService.createUnsignedDeleteTx({
      custodianAddress: params.walletAddress,
      owners: roster,
      lotReference: product.lotReference,
    } as any);
    return {
      ...tx,
      handoffOutcome: 'CONSUMED',
      warehouseId: params.warehouseId,
      inventoryKey: product.inventoryKey,
      lotReference: product.lotReference,
    };
  }
}
