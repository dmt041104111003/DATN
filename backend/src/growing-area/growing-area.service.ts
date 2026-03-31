import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrowingAreaService {
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
    const k = (keys || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (k.length === 0) return out;
    const r = (roles || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (r.length === 0) return out;
    const rows = await (this.prisma as any).entityMedia.findMany({
      where: {
        entityType: 'GROWING_AREA',
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
      const key = String(row?.entityKey || '').trim();
      const role = String(row?.role || '').trim();
      const ipfsUri = String(row?.media?.ipfsUri || '').trim();
      if (!key || !role) continue;
      out[key] ||= {};
      out[key][role] = ipfsUri || null;
    }
    return out;
  }

  async list(registeringCustodianAddress: string) {
    const addr = (registeringCustodianAddress || '').trim();
    if (!addr) throw new BadRequestException('Operator account reference is required.');
    const areas = await (this.prisma as any).growingArea.findMany({
      where: { registeringCustodianAddress: addr },
      orderBy: { createdAt: 'desc' },
    });
    const keys = Array.isArray(areas)
      ? areas.map((a: any) => String(a.inventoryKey || '').trim()).filter(Boolean)
      : [];
    if (keys.length === 0) return [];

    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType: 'GROWING_AREA', entityKey: { in: keys } },
      orderBy: { createdAt: 'desc' },
    });
    const latestByKey = new Map<string, any>();
    for (const op of ops || []) {
      const key = String(op.entityKey || '').trim();
      if (!key || latestByKey.has(key)) continue;
      latestByKey.set(key, op);
    }

    const planCountByKey: Record<string, number> = {};
    try {
      const plans = await (this.prisma as any).plan.findMany({
        where: { growingAreaInventoryKey: { in: keys } },
        select: { growingAreaInventoryKey: true },
      });
      for (const p of Array.isArray(plans) ? plans : []) {
        const k = String(p?.growingAreaInventoryKey || '').trim();
        if (!k) continue;
        planCountByKey[k] = (planCountByKey[k] || 0) + 1;
      }
    } catch {
      // ignore
    }

    const mediaByKey = await this.getMediaByRole(keys, ['AREA_IMAGE']);

    return areas.map((a: any) => {
      const inv = String(a.inventoryKey || '').trim();
      const latest = latestByKey.get(inv);
      const m = mediaByKey[inv] || {};
      return {
        ...a,
        nftImageIpfs: m['AREA_IMAGE'] ?? null,
        txHash: latest?.txHash ?? null,
        verified: Boolean(latest?.verified),
        verifiedAt: latest?.verifiedAt ?? null,
        retirePending: String(latest?.opType || '').toUpperCase() === 'RETIRE' && !latest?.verified,
        planCount: planCountByKey[inv] || 0,
      };
    });
  }

  async create(registeringCustodianAddress: string, data: {
    traceSchemeRef: string;
    inventoryKey: string;
    txHash: string;
    custodyParties: string[];
    name: string;
    location: string;
    areaSize?: string | null;
    soilType?: string | null;
    nftImageIpfs?: string | null;
  }) {
    const addr = (registeringCustodianAddress || '').trim();
    if (!addr) throw new BadRequestException('Operator account reference is required.');

    const traceSchemeRef = (data.traceSchemeRef || '').trim();
    const inventoryKey = (data.inventoryKey || '').trim();
    const txHash = (data.txHash || '').trim();
    const name = (data.name || '').trim();
    const location = (data.location || '').trim();
    const custody = Array.isArray(data.custodyParties)
      ? data.custodyParties.map((s) => String(s || '').trim()).filter(Boolean)
      : [];

    if (!traceSchemeRef || !inventoryKey || !txHash) {
      throw new BadRequestException('traceSchemeRef, inventoryKey, txHash are required.');
    }
    if (!name) throw new BadRequestException('Name is required.');
    if (!location) throw new BadRequestException('Location is required.');
    if (custody.length === 0) throw new BadRequestException('At least one owner is required.');

    const nameConflict = await (this.prisma as any).growingArea.findFirst({
      where: {
        registeringCustodianAddress: addr,
        name: { equals: name, mode: 'insensitive' },
      },
      select: { inventoryKey: true },
    });
    if (nameConflict) {
      throw new BadRequestException('Growing area name already exists. Please choose another one.');
    }

    const created = await (this.prisma as any).growingArea.create({
      data: {
        traceSchemeRef,
        inventoryKey,
        custodyRoster: custody.join('\n'),
        registeringCustodianAddress: addr,
        name,
        location,
        areaSize: (data.areaSize || '').trim() || null,
        soilType: (data.soilType || '').trim() || null,
      } as any,
    });

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'GROWING_AREA',
        entityKey: inventoryKey,
        growingAreaInventoryKey: inventoryKey,
        opType: 'CREATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    const img = data.nftImageIpfs ? String(data.nftImageIpfs).trim() : '';
    if (img) {
      await this.attachEntityMedia({
        entityType: 'GROWING_AREA',
        entityKey: created.inventoryKey,
        role: 'AREA_IMAGE',
        ipfsUri: img,
        createdByAddress: addr,
      });
    }

    return {
      ...created,
      txHash,
      verified: false,
      verifiedAt: null,
      retirePending: false,
    };
  }
}

