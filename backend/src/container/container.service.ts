import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_TYPE = 'CONTAINER';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function buildLocationLabel(provinceId: unknown, districtId: unknown, wardId: unknown) {
  return [cleanString(provinceId), cleanString(districtId), cleanString(wardId)].filter(Boolean).join(', ');
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => cleanString(x)).filter(Boolean);
  const raw = cleanString(value);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => cleanString(x)).filter(Boolean);
  } catch {}
  return raw
    .split(';')
    .map((x) => cleanString(x))
    .filter(Boolean);
}

@Injectable()
export class ContainerService {
  constructor(private readonly prisma: PrismaService) {}

  private parseKg(value: unknown): number {
    const n = Number(cleanString(value).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  async getCapacitySummary(productionInventoryKeyRaw: unknown, excludeContainerInventoryKeyRaw?: unknown) {
    const productionInventoryKey = cleanString(productionInventoryKeyRaw);
    const excludeContainerInventoryKey = cleanString(excludeContainerInventoryKeyRaw);
    if (!productionInventoryKey) throw new NotFoundException('Production not found');

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: { actualYieldKg: true },
    });
    if (!production) throw new NotFoundException('Production not found');

    const totalCapacityKg = this.parseKg(production?.actualYieldKg);
    const rows = await (this.prisma as any).container.findMany({
      where: {
        productionInventoryKey,
        ...(excludeContainerInventoryKey ? { inventoryKey: { not: excludeContainerInventoryKey } } : {}),
      },
      select: { actualCapacityKg: true },
    });
    const usedCapacityKg = (rows || []).reduce(
      (sum: number, row: any) => sum + this.parseKg(row?.actualCapacityKg),
      0,
    );
    const remainingCapacityKg = Math.max(totalCapacityKg - usedCapacityKg, 0);
    return { productionInventoryKey, totalCapacityKg, usedCapacityKg, remainingCapacityKg };
  }

  private async assertCapacityWithinRemaining(
    productionInventoryKeyRaw: unknown,
    actualCapacityKgRaw: unknown,
    excludeContainerInventoryKeyRaw?: unknown,
  ) {
    const actualCapacityKg = this.parseKg(actualCapacityKgRaw);
    if (!actualCapacityKg) return;
    const summary = await this.getCapacitySummary(productionInventoryKeyRaw, excludeContainerInventoryKeyRaw);
    if (actualCapacityKg > summary.remainingCapacityKg) {
      throw new Error(
        `Dung lượng thực tế vượt mức còn lại của vụ mùa. Còn lại: ${summary.remainingCapacityKg} kg.`,
      );
    }
  }

  private toResponse(row: any, latest?: any, txHashOverride?: string | null) {
    return {
      ...row,
      participantWalletAddresses: parseStringArray(row?.participantWalletAddresses),
      participantLocationLabels: parseStringArray(row?.participantLocationLabels),
      txHash: txHashOverride ?? latest?.txHash ?? null,
      verified: txHashOverride ? false : Boolean(latest?.verified),
      verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
    };
  }

  private buildParticipants(data: any) {
    const fromRows = Array.isArray(data?.participantRows)
      ? data.participantRows
          .map((row: any) => ({
            walletAddress: cleanString(row?.walletAddress),
            locationLabel: buildLocationLabel(row?.provinceId, row?.districtId, row?.wardId),
          }))
          .filter((row: any) => row.walletAddress)
      : [];
    const wallets = fromRows
      .map((x: any) => x.walletAddress)
      .map((x) => cleanString(x))
      .filter(Boolean);
    const locationByWallet = new Map<string, string>();
    for (const row of fromRows) {
      const key = cleanString(row.walletAddress).toLowerCase();
      if (!key) continue;
      const location = cleanString(row.locationLabel);
      if (location) locationByWallet.set(key, location);
    }
    const locations = wallets.map((wallet) => cleanString(locationByWallet.get(wallet.toLowerCase()) || ''));
    return { wallets, locations };
  }

  private async getLatestOp(inventoryKey: string) {
    return await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: ENTITY_TYPE, entityKey: inventoryKey },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async hasWarehouseStorageHistory(inventoryKeyRaw: unknown): Promise<boolean> {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return false;
    const activeStorage = await (this.prisma as any).warehouseStorage.findFirst({
      where: { containerInventoryKey: inventoryKey },
      select: { id: true },
    });
    if (activeStorage) return true;
    const op = await (this.prisma as any).recordOperation.findFirst({
      where: {
        entityType: 'WAREHOUSE_STORAGE',
        containerInventoryKey: inventoryKey,
      },
      select: { id: true },
    });
    return Boolean(op);
  }

  private async assertContainerMutable(inventoryKeyRaw: unknown) {
    const inventoryKey = cleanString(inventoryKeyRaw);
    const locked = await this.hasWarehouseStorageHistory(inventoryKey);
    if (locked) {
      throw new ConflictException(
        'Container đã có lịch sử nhập/xuất kho nên không được phép cập nhật hoặc xóa.',
      );
    }
  }

  async list(_createdBy: string) {
    const rows = await (this.prisma as any).container.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const keys = rows.map((r: any) => cleanString(r.inventoryKey)).filter(Boolean);
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType: ENTITY_TYPE, entityKey: { in: keys } },
      orderBy: { createdAt: 'desc' },
    });
    const latestByKey = new Map<string, any>();
    for (const op of ops || []) {
      const key = cleanString(op.entityKey);
      if (!key || latestByKey.has(key)) continue;
      latestByKey.set(key, op);
    }
    const inStorageRows = keys.length
      ? await (this.prisma as any).warehouseStorage.findMany({
          where: { containerInventoryKey: { in: keys } },
          select: { containerInventoryKey: true },
        })
      : [];
    const historyOps = keys.length
      ? await (this.prisma as any).recordOperation.findMany({
          where: {
            entityType: 'WAREHOUSE_STORAGE',
            containerInventoryKey: { in: keys },
          },
          select: { containerInventoryKey: true },
        })
      : [];
    const inStorageSet = new Set<string>(
      (inStorageRows || []).map((x: any) => cleanString(x?.containerInventoryKey)).filter(Boolean),
    );
    const historySet = new Set<string>([
      ...Array.from(inStorageSet.values()),
      ...(historyOps || [])
        .map((x: any) => cleanString(x?.containerInventoryKey))
        .filter(Boolean),
    ]);
    return rows.map((r: any) => {
      const inventoryKey = cleanString(r.inventoryKey);
      return {
        ...this.toResponse(r, latestByKey.get(inventoryKey)),
        storageLocked: historySet.has(inventoryKey),
        inStorage: inStorageSet.has(inventoryKey),
      };
    });
  }

  async create(createdBy: string, data: any) {
    const addr = cleanString(createdBy);
    const inventoryKey = cleanString(data.inventoryKey);
    const txHash = cleanString(data.txHash);
    await this.assertCapacityWithinRemaining(data?.productionInventoryKey, data?.actualCapacityKg);
    const participants = this.buildParticipants(data);
    const row = await (this.prisma as any).container.create({
      data: {
        traceSchemeRef: cleanString(data.traceSchemeRef),
        inventoryKey,
        code: cleanString(data.code) || `THUNG_${Date.now()}`,
        productionInventoryKey: cleanString(data.productionInventoryKey),
        registeringCustodianAddress: addr,
        location: cleanString(data.location) || null,
        containerType: cleanString(data.containerType) || null,
        capacityKg: cleanString(data.capacityKg) || null,
        actualCapacityKg: cleanString(data.actualCapacityKg) || null,
        productName: cleanString(data.productName) || null,
        participantWalletAddresses: JSON.stringify(participants.wallets),
        participantLocationLabels: participants.locations.join('; '),
        note: cleanString(data.note) || null,
        status: 'CREATE',
      } as any,
    });

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: inventoryKey,
        containerInventoryKey: inventoryKey,
        opType: 'CREATE',
        txHash,
        verified: false,
        verifiedAt: null,
        payload: {
          participantWalletAddresses: participants.wallets,
          participantLocationLabels: participants.locations,
        },
      } as any,
    });
    const fresh = await (this.prisma as any).container.findUnique({
      where: { inventoryKey },
    });
    return this.toResponse(fresh || row, undefined, txHash);
  }

  async update(createdBy: string, inventoryKey: string, data: any) {
    const key = decodeURIComponent(cleanString(inventoryKey));
    await this.assertContainerMutable(key);
    const existing = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing) throw new NotFoundException('Container not found');
    const nextProductionInventoryKey = cleanString(data?.productionInventoryKey || existing.productionInventoryKey);
    const nextActualCapacityKg = cleanString(data?.actualCapacityKg || existing.actualCapacityKg);
    await this.assertCapacityWithinRemaining(nextProductionInventoryKey, nextActualCapacityKg, key);

    const nextStatus = cleanString(data.status || existing.status).toUpperCase();
    const participants = this.buildParticipants(data);
    const patch: Record<string, unknown> = {
      status: nextStatus,
      participantWalletAddresses: JSON.stringify(participants.wallets),
      participantLocationLabels: participants.locations.join('; '),
    };
    if (data.note !== undefined) patch.note = cleanString(data.note) || null;
    if (data.containerType !== undefined) patch.containerType = cleanString(data.containerType) || null;
    if (data.capacityKg !== undefined) patch.capacityKg = cleanString(data.capacityKg) || null;
    if (data.actualCapacityKg !== undefined) patch.actualCapacityKg = cleanString(data.actualCapacityKg) || null;
    if (data.productName !== undefined) patch.productName = cleanString(data.productName) || null;
    if (data.location !== undefined) patch.location = cleanString(data.location) || null;

    const updated = await (this.prisma as any).container.update({
      where: { inventoryKey: key },
      data: patch as any,
    });
    const txHash = cleanString(data.txHash);
    if (txHash) {
      await (this.prisma as any).recordOperation.create({
        data: {
          entityType: ENTITY_TYPE,
          entityKey: key,
          containerInventoryKey: key,
          opType: 'UPDATE',
          txHash,
          verified: false,
          verifiedAt: null,
          payload: {
            participantWalletAddresses: participants.wallets,
            participantLocationLabels: participants.locations,
          },
        } as any,
      });
    }
    const latest = txHash ? null : await this.getLatestOp(key);
    const fresh = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: key },
    });
    return this.toResponse(fresh || updated, latest, txHash || undefined);
  }

  async deleteByInventoryKey(_createdBy: string, _roleRaw: unknown, inventoryKeyRaw: unknown, txHashRaw: unknown) {
    const key = cleanString(inventoryKeyRaw);
    await this.assertContainerMutable(key);
    const txHash = cleanString(txHashRaw);
    const existing = await (this.prisma as any).container.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Container not found');
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: key,
        containerInventoryKey: key,
        opType: 'DELETE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return { inventoryKey: key, pendingDelete: true };
  }
}
