import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extractSignerPayload } from '../shared/signer-payload';
const ENTITY_TYPE = 'WAREHOUSE_STORAGE';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

@Injectable()
export class WarehouseStorageService {
  constructor(private readonly prisma: PrismaService) {}

  private async writeOperation(
    opType: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONSUME',
    txHashRaw: unknown,
    storageId: string,
    containerInventoryKey: string,
    payload?: Record<string, unknown>,
  ) {
    const txHash = cleanString(txHashRaw);
    if (!txHash) return;
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: storageId,
        opType,
        txHash,
        verified: false,
        verifiedAt: null,
        containerInventoryKey: cleanString(containerInventoryKey) || null,
        payload: payload || null,
      } as any,
    });
  }

  async list(createdBy: string) {
    const custodian = cleanString(createdBy);
    const rows = await (this.prisma as any).warehouseStorage.findMany({
      where: {
        warehouse: { registeringCustodianAddress: custodian },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: { select: { id: true, name: true } },
        container: { select: { inventoryKey: true, code: true } },
      },
    });
    const entityKeys = rows.map((row: any) => cleanString(row?.id)).filter(Boolean);
    const ops = entityKeys.length
      ? await (this.prisma as any).recordOperation.findMany({
          where: {
            entityType: ENTITY_TYPE,
            entityKey: { in: entityKeys },
          },
          orderBy: { createdAt: 'desc' },
          select: { entityKey: true, verified: true, verifiedAt: true, txHash: true },
        })
      : [];
    const latestOpByEntityKey = new Map<string, any>();
    for (const op of ops) {
      const key = cleanString((op as any)?.entityKey);
      if (!key || latestOpByEntityKey.has(key)) continue;
      latestOpByEntityKey.set(key, op);
    }
    return rows.map((row: any) => ({
      ...row,
      warehouseName: cleanString(row?.warehouse?.name),
      containerCode: cleanString(row?.container?.code),
      verified: Boolean(latestOpByEntityKey.get(cleanString(row?.id))?.verified),
      verifiedAt: latestOpByEntityKey.get(cleanString(row?.id))?.verifiedAt || null,
      txHash: latestOpByEntityKey.get(cleanString(row?.id))?.txHash || null,
    }));
  }

  async create(createdBy: string, data: any) {
    const custodian = cleanString(createdBy);
    const warehouseId = cleanString(data?.warehouseId);
    const containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
    const warehouse = await (this.prisma as any).warehouse.findFirst({
      where: { id: warehouseId, registeringCustodianAddress: custodian },
      select: { id: true, location: true, name: true },
    });
    if (!warehouse) throw new NotFoundException('Không tìm thấy kho.');
    const container = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: containerInventoryKey },
      select: { inventoryKey: true, status: true },
    });
    if (!container) throw new NotFoundException('Thùng hàng không tồn tại');
    if (cleanString((container as any)?.status).toUpperCase() === 'CONSUMED') {
      throw new ConflictException('Thùng hàng đã tiêu thụ, không thể nhập kho lại.');
    }
    const duplicated = await (this.prisma as any).warehouseStorage.findFirst({
      where: { containerInventoryKey },
      select: { id: true },
    });
    if (duplicated) {
      throw new ConflictException(
        'Thùng hàng đang ở trong kho lưu trữ, cần xuất kho trước khi nhập kho mới.',
      );
    }
    const row = await (this.prisma as any).warehouseStorage.create({
      data: {
        warehouseId,
        containerInventoryKey,
        conditions: cleanString(data?.conditions) || null,
      } as any,
    });
    await this.writeOperation('CREATE', data?.txHash, cleanString(row?.id), containerInventoryKey, {
      warehouseId,
      warehouseName: cleanString((warehouse as any)?.name),
      storageTime: new Date().toISOString(),
      conditions: cleanString(data?.conditions) || null,
      storageOp: cleanString(data?.storageOp) || 'IN',
      ...(extractSignerPayload(data, { signerLocationLabel: cleanString((warehouse as any)?.location) }) || {}),
    });
    return row;
  }

  async update(createdBy: string, idRaw: unknown, data: any) {
    const custodian = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).warehouseStorage.findFirst({
      where: {
        id,
        warehouse: { registeringCustodianAddress: custodian },
      },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy bản ghi nhập kho.');
    const patch: Record<string, unknown> = {};
    if (data?.warehouseId !== undefined) patch.warehouseId = cleanString(data?.warehouseId);
    if (data?.containerInventoryKey !== undefined || data?.productId !== undefined) {
      patch.containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
    }
    if (data?.conditions !== undefined) patch.conditions = cleanString(data?.conditions) || null;
    const nextContainerInventoryKey = cleanString(
      patch.containerInventoryKey ?? (data?.containerInventoryKey || data?.productId),
    );
    if (nextContainerInventoryKey) {
      const targetContainer = await (this.prisma as any).container.findUnique({
        where: { inventoryKey: nextContainerInventoryKey },
        select: { status: true },
      });
      if (cleanString((targetContainer as any)?.status).toUpperCase() === 'CONSUMED') {
        throw new ConflictException('Thùng hàng đã tiêu thụ, không thể nhập kho lại.');
      }
      const duplicated = await (this.prisma as any).warehouseStorage.findFirst({
        where: {
          containerInventoryKey: nextContainerInventoryKey,
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new ConflictException(
          'Thùng hàng đang ở trong kho lưu trữ, cần xuất kho trước khi nhập kho mới.',
        );
      }
    }
    const row = await (this.prisma as any).warehouseStorage.update({
      where: { id },
      data: patch as any,
    });
    const warehouseId = cleanString((row as any)?.warehouseId || data?.warehouseId);
    const warehouse = warehouseId
      ? await (this.prisma as any).warehouse.findUnique({
          where: { id: warehouseId },
          select: { location: true, name: true },
        })
      : null;
    await this.writeOperation(
      'UPDATE',
      data?.txHash,
      id,
      cleanString((row as any)?.containerInventoryKey || data?.containerInventoryKey || data?.productId),
      {
        warehouseId,
        warehouseName: cleanString((warehouse as any)?.name),
        storageTime: new Date().toISOString(),
        conditions: cleanString((row as any)?.conditions),
        storageOp: cleanString(data?.storageOp) || 'UPDATE',
        ...(extractSignerPayload(data, { signerLocationLabel: cleanString((warehouse as any)?.location) }) || {}),
      },
    );
    return row;
  }

  async remove(createdBy: string, roleRaw: unknown, idRaw: unknown, data?: any) {
    const custodian = cleanString(createdBy);
    const role = cleanString(roleRaw).toUpperCase();
    const isAgent = role === 'AGENT';
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).warehouseStorage.findFirst({
      where: {
        id,
        warehouse: { registeringCustodianAddress: custodian },
      },
      select: { id: true, containerInventoryKey: true, warehouseId: true, conditions: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy bản ghi nhập kho.');
    const container = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: cleanString((existing as any)?.containerInventoryKey) },
      select: { status: true },
    });
    if (cleanString((container as any)?.status).toUpperCase() === 'CONSUMED') {
      throw new ConflictException('Thùng hàng đã tiêu thụ trước đó.');
    }

    const warehouseId = cleanString((existing as any)?.warehouseId);
    const warehouse = warehouseId
      ? await (this.prisma as any).warehouse.findUnique({
          where: { id: warehouseId },
          select: { location: true, name: true },
        })
      : null;
    await this.writeOperation(isAgent ? 'CONSUME' : 'DELETE', data?.txHash, id, cleanString((existing as any)?.containerInventoryKey), {
      warehouseId,
      warehouseName: cleanString((warehouse as any)?.name),
      storageTime: new Date().toISOString(),
      conditions: cleanString((existing as any)?.conditions),
      storageOp: cleanString(data?.storageOp) || (isAgent ? 'CONSUMED' : 'OUT'),
      ...(extractSignerPayload(data, { signerLocationLabel: cleanString((warehouse as any)?.location) }) || {}),
    });
    if (isAgent) {
      await (this.prisma as any).container.update({
        where: { inventoryKey: cleanString((existing as any)?.containerInventoryKey) },
        data: { status: 'CONSUMED' } as any,
      });
    }
    await (this.prisma as any).warehouseStorage.delete({
      where: { id },
    });
    return { id, deleted: true, txHash: cleanString(data?.txHash) || null };
  }
}

