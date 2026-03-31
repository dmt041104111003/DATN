import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_TYPE = 'PLAN';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  private async attachEntityMedia(input: {
    entityType: 'PRODUCT' | 'PLAN' | 'GROWING_AREA' | 'RECORD_OPERATION';
    entityKey: string;
    role: string;
    ipfsUri: string;
    createdByAddress?: string | null;
  }) {
    const ipfsUri = String(input.ipfsUri || '').trim();
    if (!ipfsUri) return;
    const media = await (this.prisma as any).media.upsert({
      where: { ipfsUri },
      create: {
        ipfsUri,
        ipfsHash: ipfsUri.startsWith('ipfs://') ? ipfsUri.slice('ipfs://'.length) : null,
        createdByAddress: input.createdByAddress || null,
      } as any,
      update: {} as any,
    });
    await (this.prisma as any).entityMedia.upsert({
      where: {
        entityType_entityKey_role: {
          entityType: input.entityType,
          entityKey: input.entityKey,
          role: input.role,
        },
      },
      create: {
        entityType: input.entityType,
        entityKey: input.entityKey,
        role: input.role,
        mediaId: String(media.id),
      } as any,
      update: {
        mediaId: String(media.id),
      } as any,
    });
  }

  private async getMediaByRole(keys: string[], roles: string[]) {
    const out: Record<string, Record<string, string | null>> = {};
    const k = (keys || []).map(cleanString).filter(Boolean);
    if (k.length === 0) return out;
    const r = (roles || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (r.length === 0) return out;
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
    });
    for (const row of Array.isArray(rows) ? rows : []) {
      const key = cleanString(row?.entityKey);
      const role = String(row?.role || '').trim();
      const ipfsUri = cleanString(row?.media?.ipfsUri);
      if (!key || !role) continue;
      out[key] ||= {};
      out[key][role] = ipfsUri || null;
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

    const plans = await (this.prisma as any).plan.findMany({
      where: { createdBy: addr },
      orderBy: { createdAt: 'desc' },
    });

    const keys = Array.isArray(plans)
      ? plans.map((p: any) => cleanString(p.inventoryKey)).filter(Boolean)
      : [];
    if (keys.length === 0) return [];

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

    const mediaByKey = await this.getMediaByRole(keys, [
      'PLAN_CERTIFICATE',
      'PLAN_INVOICE',
      'PLAN_HARVEST_IMAGE',
      'PLAN_PACKAGING_IMAGE',
    ]);

    return plans.map((p: any) => {
      const invKey = cleanString(p.inventoryKey);
      const latest = latestByKey.get(invKey);
      const opType = cleanString(latest?.opType).toUpperCase();
      const m = mediaByKey[invKey] || {};
      return {
        ...p,
        seedCertificateIpfs: m['PLAN_CERTIFICATE'] ?? null,
        seedInvoiceIpfs: m['PLAN_INVOICE'] ?? null,
        harvestImageIpfs: m['PLAN_HARVEST_IMAGE'] ?? null,
        packagingImageIpfs: m['PLAN_PACKAGING_IMAGE'] ?? null,
        txHash: latest?.txHash ?? null,
        verified: Boolean(latest?.verified),
        verifiedAt: latest?.verifiedAt ?? null,
        retirePending: opType === 'RETIRE' && !latest?.verified,
        harvestPending: opType === 'HARVEST' && !latest?.verified,
        packagingPending: opType === 'PACKAGING' && !latest?.verified,
      };
    });
  }

  async create(createdBy: string, data: any) {
    const addr = cleanString(createdBy);
    if (!addr) throw new BadRequestException('Operator account reference is required.');

    const traceSchemeRef = cleanString(data.traceSchemeRef);
    const growingAreaInventoryKey = cleanString(data.growingAreaInventoryKey);
    const inventoryKey = cleanString(data.inventoryKey);
    const txHash = cleanString(data.txHash);

    if (!traceSchemeRef) throw new BadRequestException('traceSchemeRef is required.');
    if (!growingAreaInventoryKey) throw new BadRequestException('growingAreaInventoryKey is required.');
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');
    if (!txHash) throw new BadRequestException('txHash is required.');

    const planExists = await (this.prisma as any).plan.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true },
    });
    if (planExists) throw new BadRequestException('Plan already exists.');

    const growingArea = await (this.prisma as any).growingArea.findUnique({
      where: { inventoryKey: growingAreaInventoryKey },
    });
    if (!growingArea) {
      throw new BadRequestException('Growing area was not found.');
    }

    const plan = await (this.prisma as any).plan.create({
      data: {
        traceSchemeRef,
        inventoryKey,
        growingAreaInventoryKey,
        growingAreaSnapshot: growingArea,
        nurseryBatch: cleanString(data.nurseryBatch),
        plantingBatch: cleanString(data.plantingBatch),
        cropType: cleanString(data.cropType),
        nurseryArea: cleanString(data.nurseryArea),
        plantingArea: cleanString(data.plantingArea),
        seedQuantityValue: cleanString(data.seedQuantityValue),
        seedQuantityUnit: cleanString(data.seedQuantityUnit),
        plantQuantityValue: cleanString(data.plantQuantityValue),
        plantQuantityUnit: cleanString(data.plantQuantityUnit),
        createdBy: addr,
        plannedSeedingDate: new Date(data.plannedSeedingDate),
        plannedPlantingDate: new Date(data.plannedPlantingDate),
        plannedHarvestDate: data.plannedHarvestDate ? new Date(data.plannedHarvestDate) : null,
        expectedHarvestYield: cleanString(data.expectedHarvestYield) || null,
        plannedProcessingDate: data.plannedProcessingDate ? new Date(data.plannedProcessingDate) : null,
        expectedProcessingYield: cleanString(data.expectedProcessingYield) || null,
        plannedPackagingDate: data.plannedPackagingDate ? new Date(data.plannedPackagingDate) : null,
        expectedPackagingQuantity: cleanString(data.expectedPackagingQuantity) || null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        packagingSpec: cleanString(data.packagingSpec) || null,
        stage: 'PLANNED',
        harvestedAt: null,
      } as any,
    });

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: inventoryKey,
        planInventoryKey: inventoryKey,
        opType: 'CREATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    const cert = cleanString(data.seedCertificateIpfs);
    const inv = cleanString(data.seedInvoiceIpfs);
    if (cert) {
      await this.attachEntityMedia({
        entityType: 'PLAN',
        entityKey: plan.inventoryKey,
        role: 'PLAN_CERTIFICATE',
        ipfsUri: cert,
        createdByAddress: addr,
      });
    }
    if (inv) {
      await this.attachEntityMedia({
        entityType: 'PLAN',
        entityKey: plan.inventoryKey,
        role: 'PLAN_INVOICE',
        ipfsUri: inv,
        createdByAddress: addr,
      });
    }

    return { ...plan, txHash, verified: false, verifiedAt: null, retirePending: false };
  }

  async update(createdBy: string, inventoryKey: string, data: any) {
    const addr = cleanString(createdBy);
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const key = decodeURIComponent(cleanString(inventoryKey));
    if (!key) throw new BadRequestException('inventoryKey is required.');

    const existing = await (this.prisma as any).plan.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Plan not found');

    const lastOp = await this.getLatestOp(key);
    if (lastOp && !lastOp.verified) {
      throw new BadRequestException('This plan is still being verified. Please try again soon.');
    }
    const stage = String(existing.stage || '').toUpperCase();
    if (stage === 'HARVESTED' || stage === 'PACKAGED') {
      throw new BadRequestException('This plan cannot be edited after harvest.');
    }

    const patch: Record<string, unknown> = {};
    const fields = [
      'nurseryBatch',
      'plantingBatch',
      'cropType',
      'nurseryArea',
      'plantingArea',
      'seedQuantityValue',
      'seedQuantityUnit',
      'plantQuantityValue',
      'plantQuantityUnit',
      'plannedSeedingDate',
      'plannedPlantingDate',
    ];
    for (const k of fields) {
      if (data[k] === undefined) continue;
      if (k.endsWith('Date')) {
        patch[k] = data[k] ? new Date(data[k]) : null;
      } else {
        const v = cleanString(data[k]);
        patch[k] = v || null;
      }
    }

    const updated = await (this.prisma as any).plan.update({
      where: { inventoryKey: key },
      data: patch as any,
    });

    const txHash = cleanString(data.txHash);
    if (txHash) {
      await (this.prisma as any).recordOperation.create({
        data: {
          entityType: ENTITY_TYPE,
          entityKey: key,
          planInventoryKey: key,
          opType: 'UPDATE',
          txHash,
          verified: false,
          verifiedAt: null,
        } as any,
      });
    }

    return {
      ...updated,
      txHash: txHash || lastOp?.txHash || null,
      verified: txHash ? false : Boolean(lastOp?.verified),
      verifiedAt: txHash ? null : lastOp?.verifiedAt ?? null,
      retirePending: false,
    };
  }

  async harvest(createdBy: string, inventoryKey: string, data: any) {
    const addr = cleanString(createdBy);
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const key = decodeURIComponent(cleanString(inventoryKey));
    if (!key) throw new BadRequestException('inventoryKey is required.');

    const existing = await (this.prisma as any).plan.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Plan not found');
    const stage = String(existing.stage || '').toUpperCase();
    if (stage === 'HARVESTED' || stage === 'PACKAGED') {
      throw new BadRequestException('This plan is already harvested.');
    }

    const lastOp = await this.getLatestOp(key);
    if (lastOp && !lastOp.verified) {
      throw new BadRequestException('This plan is still being verified. Please try again soon.');
    }

    const txHash = cleanString(data.txHash);
    if (!txHash) throw new BadRequestException('txHash is required.');

    const harvestImageIpfs = cleanString(data.harvestImageIpfs);
    if (!harvestImageIpfs) throw new BadRequestException('Harvest image is required.');

    const payload: Record<string, unknown> = {
      plannedHarvestDate: data.plannedHarvestDate ?? null,
      expectedHarvestYield: cleanString(data.expectedHarvestYield) || null,
      plannedProcessingDate: data.plannedProcessingDate ?? null,
      expectedProcessingYield: cleanString(data.expectedProcessingYield) || null,
      harvestImageIpfs,
    };

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: key,
        planInventoryKey: key,
        opType: 'HARVEST',
        txHash,
        verified: false,
        verifiedAt: null,
        payload: payload as any,
      } as any,
    });

    await this.attachEntityMedia({
      entityType: 'PLAN',
      entityKey: key,
      role: 'PLAN_HARVEST_IMAGE',
      ipfsUri: harvestImageIpfs,
      createdByAddress: addr,
    });

    return { success: true };
  }

  async packaging(createdBy: string, inventoryKey: string, data: any) {
    const addr = cleanString(createdBy);
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const key = decodeURIComponent(cleanString(inventoryKey));
    if (!key) throw new BadRequestException('inventoryKey is required.');

    const existing = await (this.prisma as any).plan.findUnique({ where: { inventoryKey: key } });
    if (!existing) throw new NotFoundException('Plan not found');

    const stage = String(existing.stage || '').toUpperCase();
    if (stage !== 'HARVESTED') {
      throw new BadRequestException('This plan must be harvested before packaging.');
    }

    const lastOp = await this.getLatestOp(key);
    if (lastOp && !lastOp.verified) {
      throw new BadRequestException('This plan is still being verified. Please try again soon.');
    }

    const txHash = cleanString(data.txHash);
    if (!txHash) throw new BadRequestException('txHash is required.');

    const packagingImageIpfs = cleanString(data.packagingImageIpfs);
    if (!packagingImageIpfs) throw new BadRequestException('Packaging image is required.');

    const payload: Record<string, unknown> = {
      plannedPackagingDate: data.plannedPackagingDate ?? null,
      expectedPackagingQuantity: cleanString(data.expectedPackagingQuantity) || null,
      expiryDate: data.expiryDate ?? null,
      packagingSpec: cleanString(data.packagingSpec) || null,
      packagingImageIpfs,
    };

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: ENTITY_TYPE,
        entityKey: key,
        planInventoryKey: key,
        opType: 'PACKAGING',
        txHash,
        verified: false,
        verifiedAt: null,
        payload: payload as any,
      } as any,
    });

    await this.attachEntityMedia({
      entityType: 'PLAN',
      entityKey: key,
      role: 'PLAN_PACKAGING_IMAGE',
      ipfsUri: packagingImageIpfs,
      createdByAddress: addr,
    });

    return { success: true };
  }
}

