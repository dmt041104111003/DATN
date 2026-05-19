import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_TYPE = 'PRODUCTION';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  private certToString(value: unknown): string | null {
    if (!Array.isArray(value)) return null;
    const packed = value.map((x) => cleanString(x)).filter(Boolean).join('|');
    return packed || null;
  }

  private async attachMediaBatch(entityKey: string, addr: string, evidenceFiles: unknown[]) {
    for (const uri of evidenceFiles) {
      const ipfsUri = cleanString(uri);
      if (!ipfsUri) continue;

      await (this.prisma as any).image.upsert({
        where: {
          productionInventoryKey_ipfsUri: {
            productionInventoryKey: entityKey,
            ipfsUri,
          },
        },
        create: {
          productionInventoryKey: entityKey,
          ipfsUri,
          ipfsHash: ipfsUri.startsWith('ipfs://') ? ipfsUri.slice('ipfs://'.length) : null,
          createdByAddress: addr || null,
        } as any,
        update: {} as any,
      });
    }
  }

  private composeResponse(row: any, media: string[], latest?: any, txHashOverride?: string | null) {
    const packed = cleanString(row?.certifications);
    return {
      ...row,
      certifications: packed ? packed.split('|').filter(Boolean) : [],
      images: media,
      evidenceFiles: media,
      txHash: txHashOverride ?? latest?.txHash ?? null,
      verified: txHashOverride ? false : Boolean(latest?.verified),
      verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
    };
  }

  private async getMediaByKey(keys: string[]) {
    const out: Record<string, string[]> = {};
    const k = (keys || []).map(cleanString).filter(Boolean);
    if (k.length === 0) return out;
    const rows = await (this.prisma as any).image.findMany({
      where: {
        productionInventoryKey: { in: k },
      },
      select: {
        productionInventoryKey: true,
        ipfsUri: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    for (const row of Array.isArray(rows) ? rows : []) {
      const key = cleanString((row as any)?.productionInventoryKey);
      const ipfsUri = cleanString((row as any)?.ipfsUri);
      if (!key || !ipfsUri) continue;
      out[key] ||= [];
      out[key].push(ipfsUri);
    }
    return out;
  }

  async list() {
    const rows = await (this.prisma as any).production.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const keys = (rows || []).map((r: any) => cleanString(r.inventoryKey)).filter(Boolean);
    const mediaByKey = await this.getMediaByKey(keys);

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

    return (rows || []).map((r: any) => {
      const key = cleanString(r.inventoryKey);
      const m = mediaByKey[key] || [];
      const latest = latestByKey.get(key);
      return this.composeResponse(r, m, latest);
    });
  }

  async create(createdBy: string, data: any) {
    const addr = cleanString(createdBy);
    const traceSchemeRef = cleanString(data.traceSchemeRef);
    const inventoryKey = cleanString(data.inventoryKey);
    const txHash = cleanString(data.txHash);

    const seedingDate = data?.seedingDate ? new Date(data.seedingDate) : null;

    const production = await (this.prisma as any).production.create({
      data: {
        traceSchemeRef,
        inventoryKey,
        code: cleanString(data.code) || `VU_${Date.now()}`,
        registeringCustodianAddress: addr,
        facilityId: cleanString(data.facilityId),
        location: cleanString(data.location),
        farmingMethod: cleanString(data.farmingMethod),
        cropType: cleanString(data.cropType),
        varietyId: cleanString(data.varietyId) || null,
        customVariety: cleanString(data.customVariety) || null,
        seedingDate,
        harvestDate: data?.harvestDate ? new Date(data.harvestDate) : null,
        expectedYieldKg: cleanString(data.expectedYieldKg) || null,
        actualYieldKg: cleanString(data.actualYieldKg) || null,
        status: 'CREATED',
        certifications: this.certToString(data?.certifications),
        customCertificationName: cleanString(data?.customCertificationName) || null,
        note: cleanString(data.note) || null,
      } as any,
    });

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: inventoryKey,
        productionInventoryKey: inventoryKey,
        opType: 'CREATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
    await this.attachMediaBatch(inventoryKey, addr, evidenceFiles);
    return this.composeResponse(
      production,
      [...(evidenceFiles as string[])],
      undefined,
      txHash,
    );
  }

  async update(createdBy: string, inventoryKey: string, data: any) {
    const addr = cleanString(createdBy);
    const key = decodeURIComponent(cleanString(inventoryKey));

    const existing = await (this.prisma as any).production.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Không tìm thấy bản ghi sản xuất.');

    const nextStatus = cleanString(data.status || existing.status).toUpperCase();

    const patch: Record<string, unknown> = {};
    if (nextStatus === 'CREATED' || nextStatus === 'UPDATED') {
      if (cleanString(existing.varietyId) === '' && data.varietyId !== undefined) {
        patch.varietyId = cleanString(data.varietyId) || null;
      }
      if (data.customVariety !== undefined) patch.customVariety = cleanString(data.customVariety) || null;
      if (data.note !== undefined) patch.note = cleanString(data.note) || null;
      if (data.certifications !== undefined) {
        patch.certifications = this.certToString(data.certifications);
      }
      if (data.customCertificationName !== undefined) {
        patch.customCertificationName = cleanString(data.customCertificationName) || null;
      }
      if (data.expectedYieldKg !== undefined) {
        const expected = cleanString(data.expectedYieldKg);
        patch.expectedYieldKg = expected || null;
      }
    }
    if (nextStatus === 'CLOSED') {
      const harvestDate = data?.harvestDate ? new Date(data.harvestDate) : null;
      const actualYieldKg = cleanString(data?.actualYieldKg);
      patch.harvestDate = harvestDate || null;
      patch.actualYieldKg = actualYieldKg;
    }
    patch.status = nextStatus;

    const updated = await (this.prisma as any).production.update({
      where: { inventoryKey: key },
      data: patch as any,
    });

    const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
    await this.attachMediaBatch(key, addr, evidenceFiles);

    const txHash = cleanString(data.txHash);
    const opType = nextStatus === 'CLOSED' ? 'HARVEST_CLOSE' : 'UPDATE';
    if (txHash) {
      await (this.prisma as any).recordOperation.create({
        data: {
          entityType: ENTITY_TYPE,
          entityKey: key,
          productionInventoryKey: key,
          opType,
          txHash,
          verified: false,
          verifiedAt: null,
        } as any,
      });
    }
    const latestOpAfterUpdate = txHash
      ? null
      : await (this.prisma as any).recordOperation.findFirst({
          where: { entityType: ENTITY_TYPE, entityKey: key },
          orderBy: { createdAt: 'desc' },
        });

    return this.composeResponse(
      updated,
      [...(evidenceFiles as string[])],
      latestOpAfterUpdate,
      txHash || undefined,
    );
  }

  async deleteByInventoryKey(inventoryKeyRaw: unknown, txHashRaw: unknown) {
    const key = cleanString(inventoryKeyRaw);
    const txHash = cleanString(txHashRaw);

    const existing = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy bản ghi sản xuất.');
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: key,
        productionInventoryKey: key,
        opType: 'DELETE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return { inventoryKey: key, pendingDelete: true };
  }
}
