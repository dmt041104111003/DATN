import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ENTITY_TYPE = 'CONTAINER';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function uniqWallets(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const wallet = cleanString(raw);
    if (!wallet) continue;
    const key = wallet.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(wallet);
  }
  return out;
}

function buildLocationLabel(provinceId: unknown, districtId: unknown, wardId: unknown) {
  return [cleanString(provinceId), cleanString(districtId), cleanString(wardId)].filter(Boolean).join(', ');
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
      participantWalletAddresses: Array.isArray(row?.participantWalletAddresses)
        ? row.participantWalletAddresses.map((x: unknown) => cleanString(x)).filter(Boolean)
        : [],
      participantLocationLabels: Array.isArray(row?.participantLocationLabels)
        ? row.participantLocationLabels.map((x: unknown) => cleanString(x)).filter(Boolean)
        : [],
      txHash: txHashOverride ?? latest?.txHash ?? null,
      verified: txHashOverride ? false : Boolean(latest?.verified),
      verifiedAt: txHashOverride ? null : latest?.verifiedAt ?? null,
    };
  }

  private buildParticipants(data: any, ownerWallet: string, fallbackLocationLabel = '') {
    const owner = cleanString(ownerWallet);
    const fallbackLocation = cleanString(fallbackLocationLabel);

    const fromRows = Array.isArray(data?.participantRows)
      ? data.participantRows
          .map((row: any) => ({
            walletAddress: cleanString(row?.walletAddress),
            locationLabel: buildLocationLabel(row?.provinceId, row?.districtId, row?.wardId),
          }))
          .filter((row: any) => row.walletAddress)
      : [];
    const fromWalletArray = Array.isArray(data?.participantWalletAddresses)
      ? data.participantWalletAddresses.map((x: unknown) => cleanString(x)).filter(Boolean)
      : [];
    const fromLocationArray = Array.isArray(data?.participantLocationLabels)
      ? data.participantLocationLabels.map((x: unknown) => cleanString(x)).filter(Boolean)
      : [];

    const wallets = uniqWallets([owner, ...fromRows.map((x: any) => x.walletAddress), ...fromWalletArray]);
    const locationByWallet = new Map<string, string>();
    if (owner && fallbackLocation) locationByWallet.set(owner.toLowerCase(), fallbackLocation);
    for (const row of fromRows) {
      const key = cleanString(row.walletAddress).toLowerCase();
      if (!key) continue;
      const location = cleanString(row.locationLabel);
      if (location) locationByWallet.set(key, location);
    }
    for (let i = 0; i < fromWalletArray.length; i += 1) {
      const key = cleanString(fromWalletArray[i]).toLowerCase();
      const location = cleanString(fromLocationArray[i]);
      if (!key || !location) continue;
      locationByWallet.set(key, location);
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
    return rows.map((r: any) => this.toResponse(r, latestByKey.get(cleanString(r.inventoryKey))));
  }

  async create(createdBy: string, data: any) {
    const addr = cleanString(createdBy);
    const inventoryKey = cleanString(data.inventoryKey);
    const txHash = cleanString(data.txHash);
    await this.assertCapacityWithinRemaining(data?.productionInventoryKey, data?.actualCapacityKg);
    const ownerLocationLabel = buildLocationLabel(data?.currentProvinceId, data?.currentDistrictId, data?.currentWardId);
    const participants = this.buildParticipants(data, addr, ownerLocationLabel);
    const row = await (this.prisma as any).container.create({
      data: {
        traceSchemeRef: cleanString(data.traceSchemeRef),
        inventoryKey,
        code: cleanString(data.code) || `THUNG_${Date.now()}`,
        productionInventoryKey: cleanString(data.productionInventoryKey),
        registeringCustodianAddress: addr,
        currentProvinceId: cleanString(data.currentProvinceId) || null,
        currentDistrictId: cleanString(data.currentDistrictId) || null,
        currentWardId: cleanString(data.currentWardId) || null,
        containerType: cleanString(data.containerType) || null,
        capacityKg: cleanString(data.capacityKg) || null,
        actualCapacityKg: cleanString(data.actualCapacityKg) || null,
        productName: cleanString(data.productName) || null,
        participantWalletAddresses: participants.wallets,
        participantLocationLabels: participants.locations,
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
    const existing = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: key },
    });
    if (!existing) throw new NotFoundException('Container not found');
    const nextProductionInventoryKey = cleanString(data?.productionInventoryKey || existing.productionInventoryKey);
    const nextActualCapacityKg = cleanString(data?.actualCapacityKg || existing.actualCapacityKg);
    await this.assertCapacityWithinRemaining(nextProductionInventoryKey, nextActualCapacityKg, key);

    const nextStatus = cleanString(data.status || existing.status).toUpperCase();
    const nextProvinceId = data.currentProvinceId !== undefined ? data.currentProvinceId : existing.currentProvinceId;
    const nextDistrictId = data.currentDistrictId !== undefined ? data.currentDistrictId : existing.currentDistrictId;
    const nextWardId = data.currentWardId !== undefined ? data.currentWardId : existing.currentWardId;
    const participants = this.buildParticipants(
      data,
      cleanString(existing.registeringCustodianAddress || createdBy),
      buildLocationLabel(nextProvinceId, nextDistrictId, nextWardId),
    );
    const patch: Record<string, unknown> = {
      status: nextStatus,
      participantWalletAddresses: participants.wallets,
      participantLocationLabels: participants.locations,
    };
    if (data.note !== undefined) patch.note = cleanString(data.note) || null;
    if (data.containerType !== undefined) patch.containerType = cleanString(data.containerType) || null;
    if (data.capacityKg !== undefined) patch.capacityKg = cleanString(data.capacityKg) || null;
    if (data.actualCapacityKg !== undefined) patch.actualCapacityKg = cleanString(data.actualCapacityKg) || null;
    if (data.productName !== undefined) patch.productName = cleanString(data.productName) || null;
    if (data.currentProvinceId !== undefined) patch.currentProvinceId = cleanString(data.currentProvinceId) || null;
    if (data.currentDistrictId !== undefined) patch.currentDistrictId = cleanString(data.currentDistrictId) || null;
    if (data.currentWardId !== undefined) patch.currentWardId = cleanString(data.currentWardId) || null;

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
