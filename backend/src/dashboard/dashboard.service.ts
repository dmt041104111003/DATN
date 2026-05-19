import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function parseKg(value: unknown): number {
  const n = Number(cleanString(value).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfDaysAgo(days: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - days);
  return d;
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildDaySeries(days: number) {
  const series: string[] = [];
  const start = startOfDaysAgo(days - 1);
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    series.push(toDateKey(d));
  }
  return series;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async countPendingVerification(custodian: string, productionKeys: string[], containerKeys: string[], storageIds: string[]) {
    const or: any[] = [];
    if (productionKeys.length) {
      or.push({ entityType: 'PRODUCTION', entityKey: { in: productionKeys } });
    }
    if (containerKeys.length) {
      or.push({ entityType: 'CONTAINER', entityKey: { in: containerKeys } });
    }
    if (storageIds.length) {
      or.push({ entityType: 'WAREHOUSE_STORAGE', entityKey: { in: storageIds } });
    }
    if (!or.length) return 0;
    return await (this.prisma as any).recordOperation.count({
      where: { verified: false, OR: or },
    });
  }

  private async loadVerifiedContainerKeys(containerKeys: string[]) {
    const verified = new Set<string>();
    if (!containerKeys.length) return verified;
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType: 'CONTAINER', entityKey: { in: containerKeys } },
      orderBy: { createdAt: 'desc' },
      select: { entityKey: true, verified: true },
    });
    const seen = new Set<string>();
    for (const op of ops || []) {
      const key = cleanString(op.entityKey);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      if (op.verified) verified.add(key);
    }
    return verified;
  }

  private async buildWarehouseStats(custodian: string, includeConsume: boolean) {
    const warehouses = await (this.prisma as any).warehouse.findMany({
      where: { registeringCustodianAddress: custodian },
      select: { id: true, name: true, capacity: true },
    });
    const warehouseIds = warehouses.map((w: any) => cleanString(w.id)).filter(Boolean);

    const storageRows = warehouseIds.length
      ? await (this.prisma as any).warehouseStorage.findMany({
          where: { warehouseId: { in: warehouseIds } },
          select: {
            id: true,
            warehouseId: true,
            containerInventoryKey: true,
            createdAt: true,
          },
        })
      : [];

    const containerKeys = storageRows
      .map((r: any) => cleanString(r.containerInventoryKey))
      .filter(Boolean);

    const containers = containerKeys.length
      ? await (this.prisma as any).container.findMany({
          where: { inventoryKey: { in: containerKeys } },
          select: { inventoryKey: true, weightPerBoxKg: true, status: true },
        })
      : [];

    const containerByKey = new Map<string, any>();
    for (const row of containers || []) {
      containerByKey.set(cleanString(row.inventoryKey), row);
    }

    let usedKg = 0;
    let inStorageCount = 0;
    const usedByWarehouse = new Map<string, number>();

    for (let i = 0; i < storageRows.length; i += 1) {
      const storage = storageRows[i];
      const key = cleanString(storage.containerInventoryKey);
      const container = containerByKey.get(key);
      const weight = parseKg(container?.weightPerBoxKg);
      usedKg += weight;
      inStorageCount += 1;
      const warehouseId = cleanString(storage.warehouseId);
      usedByWarehouse.set(warehouseId, (usedByWarehouse.get(warehouseId) || 0) + weight);
    }

    let totalCapacityKg = 0;
    const warehouseUtilization = warehouses.map((w: any) => {
      const id = cleanString(w.id);
      const capacity = parseKg(w.capacity);
      totalCapacityKg += capacity;
      const used = usedByWarehouse.get(id) || 0;
      const percent = capacity > 0 ? Math.min(100, Math.round((used / capacity) * 100)) : 0;
      return {
        id,
        name: cleanString(w.name) || id,
        capacityKg: capacity,
        usedKg: used,
        utilizationPercent: percent,
      };
    });

    const todayStart = startOfToday();
    const weekStart = startOfDaysAgo(6);
    let insToday = 0;
    let insLast7Days = 0;
    const dayKeys = buildDaySeries(7);
    const insByDay = new Map<string, number>(dayKeys.map((d) => [d, 0]));

    for (let i = 0; i < storageRows.length; i += 1) {
      const createdAt = new Date(storageRows[i].createdAt);
      if (createdAt >= todayStart) insToday += 1;
      if (createdAt >= weekStart) insLast7Days += 1;
      const dk = toDateKey(createdAt);
      if (insByDay.has(dk)) insByDay.set(dk, (insByDay.get(dk) || 0) + 1);
    }

    let consumedToday = 0;
    let consumedLast7Days = 0;
    let consumedTotal = 0;
    const consumeByDay = new Map<string, number>(dayKeys.map((d) => [d, 0]));

    if (includeConsume && storageRows.length) {
      const storageIds = storageRows.map((r: any) => cleanString(r.id)).filter(Boolean);
      const consumeOps = storageIds.length
        ? await (this.prisma as any).recordOperation.findMany({
            where: {
              entityType: 'WAREHOUSE_STORAGE',
              entityKey: { in: storageIds },
              opType: 'CONSUME',
            },
            select: { createdAt: true },
          })
        : [];
      consumedTotal = consumeOps.length;
      for (let i = 0; i < consumeOps.length; i += 1) {
        const createdAt = new Date(consumeOps[i].createdAt);
        if (createdAt >= todayStart) consumedToday += 1;
        if (createdAt >= weekStart) consumedLast7Days += 1;
        const dk = toDateKey(createdAt);
        if (consumeByDay.has(dk)) consumeByDay.set(dk, (consumeByDay.get(dk) || 0) + 1);
      }
    }

    const activityByDay = dayKeys.map((date) => ({
      date,
      warehouseIn: insByDay.get(date) || 0,
      consume: includeConsume ? consumeByDay.get(date) || 0 : undefined,
    }));

    const utilizationPercent =
      totalCapacityKg > 0 ? Math.min(100, Math.round((usedKg / totalCapacityKg) * 100)) : 0;

    return {
      warehouseCount: warehouses.length,
      inStorageCount,
      totalCapacityKg,
      usedKg,
      remainingKg: Math.max(totalCapacityKg - usedKg, 0),
      utilizationPercent,
      insToday,
      insLast7Days,
      consumedToday,
      consumedLast7Days,
      consumedTotal,
      warehouseUtilization,
      activityByDay,
      storageIds: storageRows.map((r: any) => cleanString(r.id)).filter(Boolean),
    };
  }

  private async buildEnterpriseStats(custodian: string) {
    const productions = await (this.prisma as any).production.findMany({
      where: { registeringCustodianAddress: custodian },
      select: { inventoryKey: true, status: true, actualYieldKg: true },
    });
    const productionKeys = productions.map((p: any) => cleanString(p.inventoryKey)).filter(Boolean);

    let productionCreated = 0;
    let productionUpdated = 0;
    let productionClosed = 0;
    let actualYieldKg = 0;

    for (let i = 0; i < productions.length; i += 1) {
      const status = cleanString(productions[i].status).toUpperCase();
      if (status === 'CLOSED') {
        productionClosed += 1;
        actualYieldKg += parseKg(productions[i].actualYieldKg);
      } else if (status === 'UPDATED') {
        productionUpdated += 1;
      } else {
        productionCreated += 1;
      }
    }

    const containers = await (this.prisma as any).container.findMany({
      where: { registeringCustodianAddress: custodian },
      select: { inventoryKey: true, weightPerBoxKg: true, status: true },
    });
    const containerKeys = containers.map((c: any) => cleanString(c.inventoryKey)).filter(Boolean);
    const verifiedKeys = await this.loadVerifiedContainerKeys(containerKeys);

    const inStorageRows = containerKeys.length
      ? await (this.prisma as any).warehouseStorage.findMany({
          where: { containerInventoryKey: { in: containerKeys } },
          select: { containerInventoryKey: true },
        })
      : [];
    const inStorageSet = new Set(
      (inStorageRows || []).map((r: any) => cleanString(r.containerInventoryKey)).filter(Boolean),
    );

    let verified = 0;
    let consumed = 0;
    let inStorage = 0;
    let totalWeightKg = 0;
    let inStorageWeightKg = 0;

    for (let i = 0; i < containers.length; i += 1) {
      const row = containers[i];
      const key = cleanString(row.inventoryKey);
      const weight = parseKg(row.weightPerBoxKg);
      totalWeightKg += weight;
      if (verifiedKeys.has(key)) verified += 1;
      const status = cleanString(row.status).toUpperCase();
      if (status === 'CONSUMED') consumed += 1;
      if (inStorageSet.has(key)) {
        inStorage += 1;
        inStorageWeightKg += weight;
      }
    }

    const warehouseStats = await this.buildWarehouseStats(custodian, true);
    const pendingVerification = await this.countPendingVerification(
      custodian,
      productionKeys,
      containerKeys,
      warehouseStats.storageIds,
    );

    return {
      role: 'ENTERPRISE',
      production: {
        total: productions.length,
        created: productionCreated,
        updated: productionUpdated,
        closed: productionClosed,
        actualYieldKg,
      },
      container: {
        total: containers.length,
        verified,
        unverified: Math.max(containers.length - verified, 0),
        inStorage,
        outStorage: Math.max(containers.length - inStorage - consumed, 0),
        consumed,
        totalWeightKg,
        inStorageWeightKg,
      },
      warehouse: {
        warehouseCount: warehouseStats.warehouseCount,
        inStorageCount: warehouseStats.inStorageCount,
        totalCapacityKg: warehouseStats.totalCapacityKg,
        usedKg: warehouseStats.usedKg,
        remainingKg: warehouseStats.remainingKg,
        utilizationPercent: warehouseStats.utilizationPercent,
        insToday: warehouseStats.insToday,
        insLast7Days: warehouseStats.insLast7Days,
        consumedToday: warehouseStats.consumedToday,
        consumedLast7Days: warehouseStats.consumedLast7Days,
        consumedTotal: warehouseStats.consumedTotal,
      },
      warehouseUtilization: warehouseStats.warehouseUtilization,
      activityByDay: warehouseStats.activityByDay,
      pendingVerification,
    };
  }

  private async buildLogisticsStats(custodian: string, role: 'TRANSIT' | 'AGENT') {
    const includeConsume = role === 'AGENT';
    const warehouseStats = await this.buildWarehouseStats(custodian, includeConsume);
    const pendingVerification = await this.countPendingVerification(custodian, [], [], warehouseStats.storageIds);

    return {
      role,
      warehouse: {
        warehouseCount: warehouseStats.warehouseCount,
        inStorageCount: warehouseStats.inStorageCount,
        totalCapacityKg: warehouseStats.totalCapacityKg,
        usedKg: warehouseStats.usedKg,
        remainingKg: warehouseStats.remainingKg,
        utilizationPercent: warehouseStats.utilizationPercent,
        insToday: warehouseStats.insToday,
        insLast7Days: warehouseStats.insLast7Days,
        consumedToday: warehouseStats.consumedToday,
        consumedLast7Days: warehouseStats.consumedLast7Days,
        consumedTotal: warehouseStats.consumedTotal,
      },
      warehouseUtilization: warehouseStats.warehouseUtilization,
      activityByDay: warehouseStats.activityByDay,
      pendingVerification,
    };
  }

  async getStats(custodianRaw: unknown, roleRaw: unknown) {
    const custodian = cleanString(custodianRaw);
    const role = cleanString(roleRaw).toUpperCase();
    if (!custodian) throw new Error('Không xác định được ví đăng nhập.');
    if (role === 'ENTERPRISE') return this.buildEnterpriseStats(custodian);
    if (role === 'AGENT') return this.buildLogisticsStats(custodian, 'AGENT');
    return this.buildLogisticsStats(custodian, 'TRANSIT');
  }
}
