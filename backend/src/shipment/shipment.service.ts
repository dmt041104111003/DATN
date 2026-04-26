import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}

  private locationFromProfile(profile: any, fallback: string): string {
    const location = [clean(profile?.provinceId), clean(profile?.districtId), clean(profile?.wardId)]
      .filter(Boolean)
      .join('/');
    return location || fallback;
  }

  private async latestOpsByKeys(keys: string[]) {
    const rows = (keys || []).map(clean).filter(Boolean);
    if (rows.length === 0) return new Map<string, any>();
    const ops = await (this.prisma as any).recordOperation.findMany({
      where: { entityType: 'SHIPMENT', entityKey: { in: rows } },
      orderBy: { createdAt: 'desc' },
    });
    const latestByKey = new Map<string, any>();
    for (const op of ops || []) {
      const key = clean(op?.entityKey);
      if (!key || latestByKey.has(key)) continue;
      latestByKey.set(key, op);
    }
    return latestByKey;
  }

  async list(holderAddressRaw: string) {
    const rows = await (this.prisma as any).shipment.findMany({
      include: {
        packages: {
          select: {
            packageInventoryKey: true,
            package: { select: { code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const latestByKey = await this.latestOpsByKeys((rows || []).map((x: any) => clean(x?.inventoryKey)));
    return (rows || []).map((row: any) => {
      const latest = latestByKey.get(clean(row?.inventoryKey));
      return {
        ...row,
        packageInventoryKeys: Array.isArray(row?.packages)
          ? row.packages.map((x: any) => clean(x?.packageInventoryKey)).filter(Boolean)
          : [],
        packageCodes: Array.isArray(row?.packages)
          ? row.packages.map((x: any) => clean(x?.package?.code)).filter(Boolean)
          : [],
        verified: Boolean(latest?.verified),
        verifiedAt: latest?.verifiedAt ?? null,
      };
    });
  }

  async create(holderAddressRaw: string, data: any) {
    const holder = clean(holderAddressRaw);

    const txHash = clean(data?.txHash);

    const shipmentItem = data?.shipmentItem ?? {};
    const code = clean(shipmentItem?.code);
    const inventoryKey = clean(shipmentItem?.inventoryKey);
    const traceSchemeRef = clean(shipmentItem?.traceSchemeRef);

    const packageInventoryKeys = Array.isArray(data?.packageInventoryKeys)
      ? data.packageInventoryKeys.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const uniquePackageKeys = Array.from(new Set(packageInventoryKeys));

    const requestedUpdaters = Array.isArray(data?.updaterAddresses)
      ? data.updaterAddresses.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const updaterAddresses = Array.from(new Set([holder, ...requestedUpdaters]));

    const user = await (this.prisma as any).user.findUnique({
      where: { address: holder },
      select: { provinceId: true, districtId: true, wardId: true },
    });
    const initialLocation = this.locationFromProfile(user, holder);
    const updaterProfiles = await (this.prisma as any).user.findMany({
      where: { address: { in: updaterAddresses } },
      select: { address: true, provinceId: true, districtId: true, wardId: true },
    });
    const profileMap = new Map<string, any>();
    for (const row of updaterProfiles || []) {
      profileMap.set(clean(row?.address), row);
    }
    const roadmap = [
      initialLocation,
      ...updaterAddresses
        .filter((addr) => addr !== holder)
        .map((addr) => this.locationFromProfile(profileMap.get(addr), addr)),
    ];

    const packages = await (this.prisma as any).package.findMany({
      where: { inventoryKey: { in: uniquePackageKeys } },
      select: { inventoryKey: true },
    });

    const row = await (this.prisma as any).shipment.create({
      data: {
        traceSchemeRef,
        inventoryKey,
        code,
        registeringCustodianAddress: holder,
        holderAddress: holder,
        location: initialLocation,
        updaterAddresses: updaterAddresses as any,
        roadmap: roadmap as any,
        note: clean(data?.note) || null,
        status: 'CREATED',
      } as any,
    });

    for (const packageInventoryKey of uniquePackageKeys) {
      await (this.prisma as any).shipmentPackage.create({
        data: {
          shipmentInventoryKey: inventoryKey,
          packageInventoryKey,
        } as any,
      });
    }

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'SHIPMENT',
        entityKey: inventoryKey,
        opType: 'CREATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });

    return {
      ...row,
      packageInventoryKeys: uniquePackageKeys,
      verified: false,
      verifiedAt: null,
    };
  }

  async updateLocation(holderAddressRaw: string, roleRaw: unknown, shipmentInventoryKeyRaw: string, data: any) {
    const holder = clean(holderAddressRaw);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);

    const row = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey: shipmentInventoryKey },
    });
    if (!row) throw new NotFoundException('Shipment not found.');

    const location = clean(data?.location);
    const roadmap = Array.isArray(row?.roadmap) ? row.roadmap.map((x: unknown) => clean(x)).filter(Boolean) : [];
    const nextRoadmap = [...roadmap, location];

    const updated = await (this.prisma as any).shipment.update({
      where: { inventoryKey: shipmentInventoryKey },
      data: {
        location,
        roadmap: nextRoadmap as any,
      } as any,
    });
    return {
      ...updated,
      packageInventoryKeys: [],
    };
  }

  async updateStatus(holderAddressRaw: string, roleRaw: unknown, shipmentInventoryKeyRaw: string, data: any) {
    const holder = clean(holderAddressRaw);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);

    const row = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey: shipmentInventoryKey },
      include: {
        packages: {
          select: {
            packageInventoryKey: true,
            package: { select: { code: true } },
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Shipment not found.');

    const txHash = clean(data?.txHash);

    const updated = await (this.prisma as any).shipment.update({
      where: { inventoryKey: shipmentInventoryKey },
      data: { status: 'IN_TRANSIT' } as any,
      include: {
        packages: {
          select: {
            packageInventoryKey: true,
            package: { select: { code: true } },
          },
        },
      },
    });
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'SHIPMENT',
        entityKey: shipmentInventoryKey,
        opType: 'UPDATE_STATUS',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return {
      ...updated,
      packageInventoryKeys: Array.isArray(updated?.packages)
        ? updated.packages.map((x: any) => clean(x?.packageInventoryKey)).filter(Boolean)
        : [],
      packageCodes: Array.isArray(updated?.packages)
        ? updated.packages.map((x: any) => clean(x?.package?.code)).filter(Boolean)
        : [],
    };
  }

  async updateEditable(holderAddressRaw: string, roleRaw: unknown, shipmentInventoryKeyRaw: string, data: any) {
    const holder = clean(holderAddressRaw);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);
    const txHash = clean(data?.txHash);

    const row = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey: shipmentInventoryKey },
      include: {
        packages: {
          select: {
            packageInventoryKey: true,
            package: { select: { code: true } },
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Shipment not found.');
    const note = clean(data?.note) || null;
    const updated = await (this.prisma as any).shipment.update({
      where: { inventoryKey: shipmentInventoryKey },
      data: { note } as any,
      include: {
        packages: {
          select: {
            packageInventoryKey: true,
            package: { select: { code: true } },
          },
        },
      },
    });
    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'SHIPMENT',
        entityKey: shipmentInventoryKey,
        opType: 'UPDATE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return {
      ...updated,
      packageInventoryKeys: Array.isArray(updated?.packages)
        ? updated.packages.map((x: any) => clean(x?.packageInventoryKey)).filter(Boolean)
        : [],
      packageCodes: Array.isArray(updated?.packages)
        ? updated.packages.map((x: any) => clean(x?.package?.code)).filter(Boolean)
        : [],
    };
  }

  async deleteByInventoryKey(createdByAddress: string, roleRaw: unknown, shipmentInventoryKeyRaw: unknown, txHashRaw: unknown) {
    const actor = clean(createdByAddress);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);
    const txHash = clean(txHashRaw);

    const row = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey: shipmentInventoryKey },
      select: { inventoryKey: true, holderAddress: true },
    });
    if (!row) throw new NotFoundException('Shipment not found.');

    await (this.prisma as any).recordOperation.create({
      data: {
        entityType: 'SHIPMENT',
        entityKey: shipmentInventoryKey,
        opType: 'DELETE',
        txHash,
        verified: false,
        verifiedAt: null,
      } as any,
    });
    return { inventoryKey: shipmentInventoryKey, pendingDelete: true };
  }

  async resolveUpdaterLocations(addressesRaw: unknown) {
    const addresses = Array.isArray(addressesRaw)
      ? addressesRaw.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const unique = Array.from(new Set(addresses));
    if (unique.length === 0) return [];
    const rows = await (this.prisma as any).user.findMany({
      where: { address: { in: unique } },
      select: { address: true, provinceId: true, districtId: true, wardId: true },
    });
    const map = new Map<string, any>();
    for (const row of rows || []) map.set(clean(row?.address), row);
    return unique.map((address) => {
      const row = map.get(address);
      return {
        address,
        provinceId: clean(row?.provinceId),
        districtId: clean(row?.districtId),
        wardId: clean(row?.wardId),
      };
    });
  }
}
