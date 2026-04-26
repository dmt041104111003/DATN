import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

@Injectable()
export class ShipmentScanService {
  constructor(private readonly prisma: PrismaService) {}

  async scanUpdate(actorAddressRaw: string, shipmentInventoryKeyRaw: string, data: any) {
    const actor = clean(actorAddressRaw);
    const shipmentInventoryKey = clean(shipmentInventoryKeyRaw);
    const txHash = clean(data?.txHash);
    const location = clean(data?.location);
    if (!actor) throw new BadRequestException('Operator account reference is required.');
    if (!shipmentInventoryKey) throw new BadRequestException('shipmentInventoryKey is required.');
    if (!txHash) throw new BadRequestException('txHash is required.');
    if (!location) throw new BadRequestException('location is required.');

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

    const whitelist = Array.isArray(row?.updaterAddresses)
      ? row.updaterAddresses.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    const canUpdate =
      whitelist.includes(actor) || clean(row?.registeringCustodianAddress) === actor;
    if (!canUpdate) {
      throw new BadRequestException('Your wallet is not in shipment updater whitelist.');
    }

    const roadmap = Array.isArray(row?.roadmap) ? row.roadmap.map((x: unknown) => clean(x)).filter(Boolean) : [];
    const nextRoadmap = roadmap[roadmap.length - 1] === location ? roadmap : [...roadmap, location];

    const updated = await (this.prisma as any).shipment.update({
      where: { inventoryKey: shipmentInventoryKey },
      data: {
        status: 'IN_TRANSIT',
        location,
        roadmap: nextRoadmap as any,
      } as any,
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
        opType: 'SCAN_UPDATE',
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
}

