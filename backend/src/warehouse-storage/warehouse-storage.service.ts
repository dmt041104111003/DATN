import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const ENTITY_TYPE = 'WAREHOUSE_STORAGE';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function toDateOrNull(v: unknown): Date | null {
  const raw = cleanString(v);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

@Injectable()
export class WarehouseStorageService {
  constructor(private readonly prisma: PrismaService) {}

  private async writeOperation(
    opType: 'CREATE' | 'UPDATE' | 'DELETE',
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
    return rows.map((row: any) => ({
      ...row,
      warehouseName: cleanString(row?.warehouse?.name),
      containerCode: cleanString(row?.container?.code),
    }));
  }

  async create(createdBy: string, data: any) {
    const custodian = cleanString(createdBy);
    const warehouseId = cleanString(data?.warehouseId);
    const containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
    const warehouse = await (this.prisma as any).warehouse.findFirst({
      where: { id: warehouseId, registeringCustodianAddress: custodian },
      select: { id: true },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    const container = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: containerInventoryKey },
      select: { inventoryKey: true },
    });
    if (!container) throw new NotFoundException('Container not found');
    const entryTime = toDateOrNull(data?.entryTime);
    if (!entryTime) throw new Error('Entry time is required.');
    const exitTime = toDateOrNull(data?.exitTime);
    const row = await (this.prisma as any).warehouseStorage.create({
      data: {
        warehouseId,
        containerInventoryKey,
        entryTime,
        exitTime,
        conditions: cleanString(data?.conditions) || null,
      } as any,
    });
    await this.writeOperation('CREATE', data?.txHash, cleanString(row?.id), containerInventoryKey, {
      warehouseId,
      entryTime: entryTime.toISOString(),
      exitTime: exitTime ? exitTime.toISOString() : null,
      conditions: cleanString(data?.conditions) || null,
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
    if (!existing) throw new NotFoundException('Warehouse storage not found');
    const patch: Record<string, unknown> = {};
    if (data?.warehouseId !== undefined) patch.warehouseId = cleanString(data?.warehouseId);
    if (data?.containerInventoryKey !== undefined || data?.productId !== undefined) {
      patch.containerInventoryKey = cleanString(data?.containerInventoryKey || data?.productId);
    }
    if (data?.entryTime !== undefined) {
      const entryTime = toDateOrNull(data?.entryTime);
      if (!entryTime) throw new Error('Entry time is invalid.');
      patch.entryTime = entryTime;
    }
    if (data?.exitTime !== undefined) patch.exitTime = toDateOrNull(data?.exitTime);
    if (data?.conditions !== undefined) patch.conditions = cleanString(data?.conditions) || null;
    const row = await (this.prisma as any).warehouseStorage.update({
      where: { id },
      data: patch as any,
    });
    await this.writeOperation(
      'UPDATE',
      data?.txHash,
      id,
      cleanString((row as any)?.containerInventoryKey || data?.containerInventoryKey || data?.productId),
      {
        warehouseId: cleanString((row as any)?.warehouseId || data?.warehouseId),
        entryTime: (row as any)?.entryTime ? new Date((row as any).entryTime).toISOString() : null,
        exitTime: (row as any)?.exitTime ? new Date((row as any).exitTime).toISOString() : null,
        conditions: cleanString((row as any)?.conditions),
      },
    );
    return row;
  }

  async remove(createdBy: string, idRaw: unknown, data?: any) {
    const custodian = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).warehouseStorage.findFirst({
      where: {
        id,
        warehouse: { registeringCustodianAddress: custodian },
      },
      select: { id: true, containerInventoryKey: true, warehouseId: true, entryTime: true, exitTime: true, conditions: true },
    });
    if (!existing) throw new NotFoundException('Warehouse storage not found');
    await this.writeOperation('DELETE', data?.txHash, id, cleanString((existing as any)?.containerInventoryKey), {
      warehouseId: cleanString((existing as any)?.warehouseId),
      entryTime: (existing as any)?.entryTime ? new Date((existing as any).entryTime).toISOString() : null,
      exitTime: (existing as any)?.exitTime ? new Date((existing as any).exitTime).toISOString() : null,
      conditions: cleanString((existing as any)?.conditions),
    });
    await (this.prisma as any).warehouseStorage.delete({ where: { id } });
    return { id };
  }
}

