import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

function toKg(weightValue: number, unitRaw: string, quantity: number): number | null {
  const unit = clean(unitRaw).toLowerCase();
  if (!Number.isFinite(weightValue) || weightValue <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }
  if (unit === 'kg') return weightValue * quantity;
  if (unit === 'gram') return (weightValue * quantity) / 1000;
  return null;
}

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  async getCapacity(createdByAddress: string, productionInventoryKeyRaw: unknown) {
    const owner = clean(createdByAddress);
    const productionInventoryKey = clean(productionInventoryKeyRaw);

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: {
        inventoryKey: true,
        code: true,
        status: true,
        actualYieldKg: true,
        registeringCustodianAddress: true,
      },
    });
    if (!production) throw new NotFoundException('Production not found.');
    const status = clean(production.status).toUpperCase();
    const totalYieldKg = Number(clean(production.actualYieldKg));
    if (status !== 'CLOSED') {
      return {
        productionInventoryKey,
        status,
        totalYieldKg: Number.isFinite(totalYieldKg) && totalYieldKg > 0 ? totalYieldKg : 0,
        packagedKg: 0,
        remainingKg: 0,
        canPackage: false,
        message: 'Production must be CLOSED before packaging.',
      };
    }
    if (!Number.isFinite(totalYieldKg) || totalYieldKg <= 0) {
      return {
        productionInventoryKey,
        status,
        totalYieldKg: 0,
        packagedKg: 0,
        remainingKg: 0,
        canPackage: false,
        message: 'actualYieldKg is missing or invalid.',
      };
    }

    const existing = await (this.prisma as any).package.findMany({
      where: { productionInventoryKey },
      select: { weightValue: true, weightUnit: true, quantity: true },
    });
    let packagedKg = 0;
    for (const row of existing || []) {
      const kg = toKg(Number(row?.weightValue), clean(row?.weightUnit), 1);
      if (kg === null) {
        return {
          productionInventoryKey,
          status,
          totalYieldKg,
          packagedKg,
          remainingKg: Math.max(totalYieldKg - packagedKg, 0),
          canPackage: false,
          message: 'Found package with unsupported weight unit; cannot calculate remaining yield.',
        };
      }
      packagedKg += kg;
    }
    const remainingKg = Math.max(totalYieldKg - packagedKg, 0);
    return {
      productionInventoryKey,
      status,
      totalYieldKg,
      packagedKg,
      remainingKg,
      canPackage: remainingKg > 0,
      message: remainingKg > 0 ? 'OK' : 'No remaining yield to package.',
    };
  }

  async list(createdByAddress: string) {
    const addr = clean(createdByAddress);
    const rows = await (this.prisma as any).package.findMany({
      where: { registeringCustodianAddress: addr },
      include: {
        production: {
          select: { code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const keys = (rows || []).map((r: any) => clean(r?.inventoryKey)).filter(Boolean);
    if (keys.length === 0) return [];
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType: 'PACKAGE', entityKey: { in: keys } },
      orderBy: { createdAt: 'desc' },
    });
    const latestByKey = new Map<string, any>();
    for (const op of ops || []) {
      const key = clean(op?.entityKey);
      if (!key || latestByKey.has(key)) continue;
      latestByKey.set(key, op);
    }
    return (rows || []).map((row: any) => {
      const latest = latestByKey.get(clean(row?.inventoryKey));
      return {
        ...row,
        productionCode: clean(row?.production?.code),
        verified: Boolean(latest?.verified),
        verifiedAt: latest?.verifiedAt ?? null,
      };
    });
  }

  async createBulk(createdByAddress: string, data: any) {
    const owner = clean(createdByAddress);

    const productionInventoryKey = clean(data?.productionInventoryKey);

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: {
        inventoryKey: true,
        code: true,
        traceSchemeRef: true,
        status: true,
        actualYieldKg: true,
        registeringCustodianAddress: true,
      },
    });
    if (!production) throw new NotFoundException('Production not found.');
    const weightValue = Number(data?.weightValue);
    const weightUnit = clean(data?.weightUnit).toLowerCase();

    const packagingType = clean(data?.packagingType);
    const packagingDate = data?.packagingDate ? new Date(data.packagingDate) : null;

    const agents = Array.isArray(data?.authorizedAgents)
      ? data.authorizedAgents.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const uniqueAgents = Array.from(new Set(agents));

    const traceSchemeRef = clean(production.traceSchemeRef);
    const txHash = clean(data?.txHash);

    const packageItems = Array.isArray(data?.packageItems) ? data.packageItems : [];

    const note = clean(data?.note) || null;
    const created: any[] = [];

    for (const item of packageItems) {
      const code = clean(item?.code);
      const inventoryKey = clean(item?.inventoryKey);
      const itemTraceSchemeRef = clean(item?.traceSchemeRef) || traceSchemeRef;
      const row = await (this.prisma as any).package.create({
        data: {
          traceSchemeRef: itemTraceSchemeRef,
          inventoryKey,
          code,
          registeringCustodianAddress: owner,
          holderAddress: owner,
          productionInventoryKey,
          weightValue,
          weightUnit,
          quantity: 1,
          packagingType,
          packagingDate,
          note,
          authorizedAgents: uniqueAgents as any,
          status: 'UNSOLD',
        } as any,
      });
      await (this.prisma as any).recordOperation.create({
        data: {
          entityType: 'PACKAGE',
          entityKey: inventoryKey,
          opType: 'CREATE',
          txHash,
          verified: false,
          verifiedAt: null,
        } as any,
      });
      created.push(row);
    }

    return created;
  }

  async updateEditable(createdByAddress: string, roleRaw: unknown, inventoryKeyRaw: unknown, data: any) {
    const inventoryKey = clean(inventoryKeyRaw);
    const txHash = clean(data?.txHash);

    const row = await (this.prisma as any).package.findUnique({
      where: { inventoryKey },
      select: {
        inventoryKey: true,
        holderAddress: true,
      },
    });
    if (!row) throw new NotFoundException('Package not found.');

    const weightValue = Number(data?.weightValue);
    const weightUnit = clean(data?.weightUnit).toLowerCase();
    const packagingType = clean(data?.packagingType);
    const note = clean(data?.note) || null;

    const updated = await (this.prisma as any).package.update({
      where: { inventoryKey },
      data: {
        weightValue,
        weightUnit,
        packagingType,
        note,
      } as any,
    });
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'PACKAGE',
        entityKey: inventoryKey,
        opType: 'UPDATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return updated;
  }

  async deleteByInventoryKey(createdByAddress: string, roleRaw: unknown, inventoryKeyRaw: unknown, txHashRaw: unknown) {
    const inventoryKey = clean(inventoryKeyRaw);
    const txHash = clean(txHashRaw);

    const row = await (this.prisma as any).package.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true, holderAddress: true },
    });
    if (!row) throw new NotFoundException('Package not found.');

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'PACKAGE',
        entityKey: inventoryKey,
        opType: 'DELETE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return { inventoryKey, pendingDelete: true };
  }
}

