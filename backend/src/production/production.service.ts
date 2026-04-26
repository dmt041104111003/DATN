import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_TYPE = 'PRODUCTION';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  private assertEnterprise(roleRaw: unknown) {
    const role = cleanString(roleRaw).toUpperCase();
    if (role !== 'ENTERPRISE') {
      throw new BadRequestException('Only ENTERPRISE can delete production.');
    }
  }

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
      packageCount: Number(row?._count?.packages || 0),
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
    const addr = cleanString(createdBy);
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const rows = await (this.prisma as any).production.findMany({
      where: { registeringCustodianAddress: addr },
      include: { _count: { select: { packages: true } } },
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
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const traceSchemeRef = cleanString(data.traceSchemeRef);
    const inventoryKey = cleanString(data.inventoryKey);
    const txHash = cleanString(data.txHash);
    if (!traceSchemeRef || !inventoryKey || !txHash) {
      throw new BadRequestException('traceSchemeRef, inventoryKey, txHash are required.');
    }

    const exists = await (this.prisma as any).production.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true },
    });
    if (exists) throw new BadRequestException('Production already exists.');

    const seedingDate = data?.seedingDate ? new Date(data.seedingDate) : null;
    if (!seedingDate || Number.isNaN(seedingDate.getTime())) {
      throw new BadRequestException('seedingDate is required.');
    }

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
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const key = decodeURIComponent(cleanString(inventoryKey));
    if (!key) throw new BadRequestException('inventoryKey is required.');

    const existing = await (this.prisma as any).production.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Production not found');
    if (cleanString(existing.registeringCustodianAddress) !== addr) {
      throw new BadRequestException('You are not allowed to update this production.');
    }
    const lastOp = await this.getLatestOp(key);
    if (lastOp && !lastOp.verified) {
      throw new BadRequestException('Bản ghi đang chờ xác thực on-chain, chưa thể cập nhật.');
    }
    const currentStatus = cleanString(existing.status).toUpperCase();
    if (currentStatus === 'CLOSED') {
      throw new BadRequestException('This production is already closed.');
    }

    const nextStatus = cleanString(data.status || existing.status).toUpperCase();
    if (!['ACTIVE', 'CLOSED'].includes(nextStatus)) {
      throw new BadRequestException('Invalid status transition.');
    }

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
      if (!harvestDate || Number.isNaN(harvestDate.getTime())) {
        throw new BadRequestException('harvestDate is required.');
      }
      const seedingDate = new Date(existing.seedingDate);
      const now = new Date();
      if (harvestDate.getTime() < seedingDate.getTime()) {
        throw new BadRequestException('harvestDate must be greater than or equal to seedingDate.');
      }
      if (harvestDate.getTime() > now.getTime()) {
        throw new BadRequestException('harvestDate must be less than or equal to now.');
      }
      const actualYieldKg = cleanString(data?.actualYieldKg);
      if (!actualYieldKg) {
        throw new BadRequestException('actualYieldKg is required when closing production.');
      }
      const actualYieldNumber = Number(actualYieldKg);
      if (!Number.isFinite(actualYieldNumber) || actualYieldNumber <= 0) {
        throw new BadRequestException('actualYieldKg must be greater than 0.');
      }
      patch.harvestDate = harvestDate;
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

  async deleteByInventoryKey(createdBy: string, roleRaw: unknown, inventoryKeyRaw: unknown, txHashRaw: unknown) {
    this.assertEnterprise(roleRaw);
    const addr = cleanString(createdBy);
    const key = cleanString(inventoryKeyRaw);
    const txHash = cleanString(txHashRaw);
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    if (!key) throw new BadRequestException('inventoryKey is required.');
    if (!txHash) throw new BadRequestException('txHash is required.');

    const existing = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: key },
      include: { _count: { select: { packages: true } } },
    });
    if (!existing) throw new NotFoundException('Production not found');
    if (cleanString(existing.registeringCustodianAddress) !== addr) {
      throw new BadRequestException('You are not allowed to delete this production.');
    }
    if (Number(existing?._count?.packages || 0) > 0) {
      throw new BadRequestException('Production already linked to package(s), cannot delete.');
    }
    const pendingDelete = await (this.prisma as any).recordOperation.findFirst({
      where: {
        entityType: ENTITY_TYPE,
        entityKey: key,
        opType: 'DELETE',
        verified: false,
      },
      select: { id: true },
    });
    if (pendingDelete) {
      throw new BadRequestException('Delete request is already pending verification.');
    }
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
