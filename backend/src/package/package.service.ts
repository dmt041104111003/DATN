import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(createdByAddress: string, data: any) {
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
    const packagingDate = data?.packagingDate ? new Date(data.packagingDate) : null;

    const agents = Array.isArray(data?.authorizedAgents)
      ? data.authorizedAgents.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const uniqueAgents = Array.from(new Set(agents));

    const traceSchemeRef = clean(production.traceSchemeRef);
    const txHash = clean(data?.txHash);

    const note = clean(data?.note) || null;
    const packageItem = data?.packageItem ?? {};
    const code = clean(packageItem?.code);
    const inventoryKey = clean(packageItem?.inventoryKey);
    const itemTraceSchemeRef = clean(packageItem?.traceSchemeRef) || traceSchemeRef;
    const created = await (this.prisma as any).package.create({
      data: {
        traceSchemeRef: itemTraceSchemeRef,
        inventoryKey,
        code,
        registeringCustodianAddress: owner,
        holderAddress: owner,
        productionInventoryKey,
        packagingDate,
        note,
        authorizedAgents: uniqueAgents as any,
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

    return created;
  }

  async updateEditable(createdByAddress: string, roleRaw: unknown, inventoryKeyRaw: unknown, data: any) {
    const inventoryKey = clean(inventoryKeyRaw);
    const txHash = clean(data?.txHash);

    const row = await (this.prisma as any).package.findUnique({
      where: { inventoryKey },
      select: {
        inventoryKey: true,
      },
    });
    if (!row) throw new NotFoundException('Package not found.');
    const note = clean(data?.note) || null;

    const updated = await (this.prisma as any).package.update({
      where: { inventoryKey },
      data: {
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
      select: { inventoryKey: true },
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

