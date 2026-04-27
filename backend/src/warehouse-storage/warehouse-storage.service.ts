import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const ENTITY_TYPE = 'WAREHOUSE_STORAGE';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
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
    const entityKeys = rows.map((row: any) => cleanString(row?.id)).filter(Boolean);
    const ops = entityKeys.length
      ? await (this.prisma as any).recordOperation.findMany({
          where: {
            entityType: ENTITY_TYPE,
            entityKey: { in: entityKeys },
          },
          orderBy: { createdAt: 'desc' },
          select: { entityKey: true, verified: true, verifiedAt: true },
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
    const duplicated = await (this.prisma as any).warehouseStorage.findFirst({
      where: { containerInventoryKey },
      select: { id: true },
    });
    if (duplicated) throw new ConflictException('Container already stored in warehouse');
    const row = await (this.prisma as any).warehouseStorage.create({
      data: {
        warehouseId,
        containerInventoryKey,
        conditions: cleanString(data?.conditions) || null,
      } as any,
    });
    await this.writeOperation('CREATE', data?.txHash, cleanString(row?.id), containerInventoryKey, {
      warehouseId,
      storageTime: new Date().toISOString(),
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
    if (data?.conditions !== undefined) patch.conditions = cleanString(data?.conditions) || null;
    const nextContainerInventoryKey = cleanString(
      patch.containerInventoryKey ?? (data?.containerInventoryKey || data?.productId),
    );
    if (nextContainerInventoryKey) {
      const duplicated = await (this.prisma as any).warehouseStorage.findFirst({
        where: {
          containerInventoryKey: nextContainerInventoryKey,
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicated) throw new ConflictException('Container already stored in warehouse');
    }
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
        storageTime: new Date().toISOString(),
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
      select: { id: true, containerInventoryKey: true, warehouseId: true, conditions: true },
    });
    if (!existing) throw new NotFoundException('Warehouse storage not found');
    await this.writeOperation('DELETE', data?.txHash, id, cleanString((existing as any)?.containerInventoryKey), {
      warehouseId: cleanString((existing as any)?.warehouseId),
      storageTime: new Date().toISOString(),
      conditions: cleanString((existing as any)?.conditions),
    });
    await (this.prisma as any).warehouseStorage.delete({ where: { id } });
    return { id };
  }
}

