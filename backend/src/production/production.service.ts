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

  private certToArray(value: unknown): string[] {
    const packed = cleanString(value);
    return packed ? packed.split('|').filter(Boolean) : [];
  }

  private async attachEntityMedia(entityKey: string, role: string, ipfsUriRaw: unknown, createdByAddress?: string | null) {
    const ipfsUri = cleanString(ipfsUriRaw);
    if (!ipfsUri) return;
    const media = await (this.prisma as any).media.upsert({
      where: { ipfsUri },
      create: {
        ipfsUri,
        ipfsHash: ipfsUri.startsWith('ipfs://') ? ipfsUri.slice('ipfs://'.length) : null,
        createdByAddress: createdByAddress || null,
      } as any,
      update: {} as any,
    });
    await (this.prisma as any).entityMedia.upsert({
      where: {
        entityType_entityKey_role: {
          entityType: ENTITY_TYPE,
          entityKey,
          role,
        },
      },
      create: {
        entityType: ENTITY_TYPE,
        entityKey,
        role,
        mediaId: String(media.id),
      } as any,
      update: { mediaId: String(media.id) } as any,
    });
  }

  private async attachMediaBatch(entityKey: string, addr: string, certFiles: unknown[], evidenceFiles: unknown[]) {
    for (const uri of certFiles) {
      await this.attachEntityMedia(entityKey, 'PRODUCTION_CERT_FILE', uri, addr);
    }
    for (const uri of evidenceFiles) {
      await this.attachEntityMedia(entityKey, 'PRODUCTION_EVIDENCE', uri, addr);
    }
  }

  private composeResponse(row: any, media: Record<string, string[]>, latest?: any, txHashOverride?: string | null) {
    return {
      ...row,
      certifications: this.certToArray(row?.certifications),
      certFiles: media.PRODUCTION_CERT_FILE || [],
      evidenceFiles: media.PRODUCTION_EVIDENCE || [],
      txHash: txHashOverride ?? latest?.txHash ?? null,
      verified: txHashOverride ? false : Boolean(latest?.verified),
      verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
    };
  }

  private async getMediaByRole(keys: string[], roles: string[]) {
    const out: Record<string, Record<string, string[]>> = {};
    const k = (keys || []).map(cleanString).filter(Boolean);
    const r = (roles || []).map(cleanString).filter(Boolean);
    if (k.length === 0 || r.length === 0) return out;
    const rows = await (this.prisma as any).entityMedia.findMany({
      where: {
        entityType: ENTITY_TYPE,
        entityKey: { in: k },
        role: { in: r },
      },
      select: {
        entityKey: true,
        role: true,
        media: { select: { ipfsUri: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    for (const row of Array.isArray(rows) ? rows : []) {
      const key = cleanString(row?.entityKey);
      const role = cleanString(row?.role);
      const ipfsUri = cleanString(row?.media?.ipfsUri);
      if (!key || !role || !ipfsUri) continue;
      out[key] ||= {};
      out[key][role] ||= [];
      out[key][role].push(ipfsUri);
    }
    return out;
  }

  private async getLatestOp(inventoryKey: string) {
    return await (this.prisma as any).recordOperation.findFirst({
      where: { entityType: ENTITY_TYPE, entityKey: inventoryKey },
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(createdBy: string) {
    const rows = await (this.prisma as any).production.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const keys = (rows || []).map((r: any) => cleanString(r.inventoryKey)).filter(Boolean);
    const mediaByKey = await this.getMediaByRole(keys, ['PRODUCTION_CERT_FILE', 'PRODUCTION_EVIDENCE']);

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
      const m = mediaByKey[key] || {};
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
        provinceId: cleanString(data.provinceId),
        districtId: cleanString(data.districtId),
        wardId: cleanString(data.wardId),
        farmingMethod: cleanString(data.farmingMethod),
        cropType: cleanString(data.cropType),
        varietyId: cleanString(data.varietyId) || null,
        customVariety: cleanString(data.customVariety) || null,
        seedingDate,
        harvestDate: data?.harvestDate ? new Date(data.harvestDate) : null,
        expectedYieldKg: cleanString(data.expectedYieldKg) || null,
        actualYieldKg: cleanString(data.actualYieldKg) || null,
        status: 'ACTIVE',
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

    const certFiles = Array.isArray(data?.certFiles) ? data.certFiles : [];
    const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
    await this.attachMediaBatch(inventoryKey, addr, certFiles, evidenceFiles);
    return this.composeResponse(
      production,
      { PRODUCTION_CERT_FILE: certFiles as string[], PRODUCTION_EVIDENCE: evidenceFiles as string[] },
      undefined,
      txHash,
    );
  }

  async update(createdBy: string, inventoryKey: string, data: any) {
    const addr = cleanString(createdBy);
    const key = decodeURIComponent(cleanString(inventoryKey));

    const existing = await (this.prisma as any).production.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Production not found');

    const nextStatus = cleanString(data.status || existing.status).toUpperCase();

    const patch: Record<string, unknown> = {};
    if (nextStatus === 'ACTIVE') {
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

    const certFiles = Array.isArray(data?.certFiles) ? data.certFiles : [];
    const evidenceFiles = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
    await this.attachMediaBatch(key, addr, certFiles, evidenceFiles);

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
    const latestOpAfterUpdate = txHash ? null : await this.getLatestOp(key);

    return this.composeResponse(
      updated,
      { PRODUCTION_CERT_FILE: certFiles as string[], PRODUCTION_EVIDENCE: evidenceFiles as string[] },
      latestOpAfterUpdate,
      txHash || undefined,
    );
  }

  async deleteByInventoryKey(_createdBy: string, _roleRaw: unknown, inventoryKeyRaw: unknown, txHashRaw: unknown) {
    const key = cleanString(inventoryKeyRaw);
    const txHash = cleanString(txHashRaw);

    const existing = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing) throw new NotFoundException('Production not found');
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
