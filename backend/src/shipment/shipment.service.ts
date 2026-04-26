import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

function isValidWalletAddress(value: string): boolean {
  return /^addr1[0-9a-z]+$/.test(value) || /^addr_test1[0-9a-z]+$/.test(value);
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
    const actor = clean(holderAddressRaw);
    if (!actor) throw new BadRequestException('Operator account reference is required.');
    const rows = await (this.prisma as any).shipment.findMany({
      where: {
        OR: [
          { holderAddress: actor },
          { registeringCustodianAddress: actor },
        ],
      },
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
    if (!holder) throw new BadRequestException('Operator account reference is required.');

    const txHash = clean(data?.txHash);
    if (!txHash) throw new BadRequestException('txHash is required.');

    const shipmentItem = data?.shipmentItem ?? {};
    const code = clean(shipmentItem?.code);
    const inventoryKey = clean(shipmentItem?.inventoryKey);
    const traceSchemeRef = clean(shipmentItem?.traceSchemeRef);
    if (!code || !inventoryKey || !traceSchemeRef) {
      throw new BadRequestException('shipmentItem is invalid.');
    }

    const packageInventoryKeys = Array.isArray(data?.packageInventoryKeys)
      ? data.packageInventoryKeys.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    if (packageInventoryKeys.length < 1) {
      throw new BadRequestException('packageInventoryKeys requires at least one package.');
    }
    const uniquePackageKeys = Array.from(new Set(packageInventoryKeys));
    if (uniquePackageKeys.length !== packageInventoryKeys.length) {
      throw new BadRequestException('packageInventoryKeys contains duplicated values.');
    }

    const requestedUpdaters = Array.isArray(data?.updaterAddresses)
      ? data.updaterAddresses.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const updaterAddresses = Array.from(new Set([holder, ...requestedUpdaters]));
    if (!updaterAddresses.every(isValidWalletAddress)) {
      throw new BadRequestException('updaterAddresses contains invalid wallet address format.');
    }

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
    const roadmap = [initialLocation, ...updaterAddresses.map((addr) => this.locationFromProfile(profileMap.get(addr), addr))];

    const packages = await (this.prisma as any).package.findMany({
      where: { inventoryKey: { in: uniquePackageKeys }, holderAddress: holder },
      select: { inventoryKey: true },
    });
    if ((packages || []).length !== uniquePackageKeys.length) {
      throw new BadRequestException('Some packages are invalid or not held by your address.');
    }

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

  async updateLocation(holderAddressRaw: string, shipmentInventoryKeyRaw: string, data: any) {
    const holder = clean(holderAddressRaw);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);
    if (!holder) throw new BadRequestException('Operator account reference is required.');
    if (!shipmentInventoryKey) throw new BadRequestException('shipmentInventoryKey is required.');

    const row = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey: shipmentInventoryKey },
    });
    if (!row) throw new NotFoundException('Shipment not found.');

    const updaters = Array.isArray(row?.updaterAddresses)
      ? row.updaterAddresses.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    if (!updaters.includes(holder)) {
      throw new BadRequestException('You are not allowed to update shipment location.');
    }

    const location = clean(data?.location);
    if (!location) throw new BadRequestException('location is required.');
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
