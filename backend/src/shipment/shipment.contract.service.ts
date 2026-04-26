import { BadRequestException, Injectable } from '@nestjs/common';
import { CIP68_100, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlutusHelper } from '../production/helpers/plutus.helper';
import { TxBuilderHelper } from '../production/helpers/tx-builder.helper';

function clean(v: unknown): string {
  return String(v ?? '').trim();
}

function makeShipmentCode() {
  return `LO_${Date.now()}`;
}

function locationFromProfile(profile: any, fallback: string): string {
  const location = [clean(profile?.provinceId), clean(profile?.districtId), clean(profile?.wardId)]
    .filter(Boolean)
    .join('/');
  return location || fallback;
}

function makeMetadata(base: any, shipment: { code: string; inventoryKey: string; traceSchemeRef: string }, owner: string, originLocation: string, roadmap: string[]) {
  return {
    shipment_code: clean(shipment.code),
    shipment_inventory_key: clean(shipment.inventoryKey),
    trace_scheme_ref: clean(shipment.traceSchemeRef),
    holder_address: clean(owner),
    registering_custodian_address: clean(owner),
    origin_location: clean(originLocation),
    roadmap: JSON.stringify(roadmap || []),
    package_inventory_keys: JSON.stringify(Array.isArray(base?.packageInventoryKeys) ? base.packageInventoryKeys : []),
    updater_addresses: JSON.stringify(Array.isArray(base?.updaterAddresses) ? base.updaterAddresses : []),
    note: clean(base?.note),
    status: 'CREATED',
  } as Record<string, string>;
}

@Injectable()
export class ShipmentContractService {
  private readonly blockfrostProvider: BlockfrostProvider;
  private readonly plutusHelper: PlutusHelper;
  private readonly txBuilderHelper: TxBuilderHelper;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) throw new Error('BLOCKFROST_API_KEY is not set');
    this.blockfrostProvider = new BlockfrostProvider(apiKey);
    this.plutusHelper = new PlutusHelper();
    this.txBuilderHelper = new TxBuilderHelper(this.blockfrostProvider, this.plutusHelper);
  }

  async createUnsignedCreateTx(dto: any) {
    const walletAddress = clean(dto?.custodianAddress);
    const owners = Array.isArray(dto?.owners) ? dto.owners.map(clean).filter(Boolean) : [];
    const updaterAddressesInput = Array.isArray(dto?.updaterAddresses) ? dto.updaterAddresses.map(clean).filter(Boolean) : [];
    const packageInventoryKeys = Array.isArray(dto?.packageInventoryKeys)
      ? dto.packageInventoryKeys.map(clean).filter(Boolean)
      : [];
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (packageInventoryKeys.length < 1) throw new BadRequestException('packageInventoryKeys is required.');
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const packages = await (this.prisma as any).package.findMany({
      where: { inventoryKey: { in: packageInventoryKeys }, holderAddress: walletAddress },
      select: { inventoryKey: true, traceSchemeRef: true },
    });
    if ((packages || []).length !== packageInventoryKeys.length) {
      throw new BadRequestException('Some packages are invalid or not held by your address.');
    }
    const traceSchemeRef = clean(packages?.[0]?.traceSchemeRef);
    if (!traceSchemeRef) throw new BadRequestException('Policy reference is missing from package.');

    const shipmentCode = makeShipmentCode();
    const inventoryKey = traceSchemeRef + CIP68_100(stringToHex(shipmentCode));
    const updaterAddresses = Array.from(new Set([walletAddress, ...updaterAddressesInput]));
    const updaterProfiles = await (this.prisma as any).user.findMany({
      where: { address: { in: updaterAddresses } },
      select: { address: true, provinceId: true, districtId: true, wardId: true },
    });
    const updaterMap = new Map<string, any>();
    for (const row of updaterProfiles || []) {
      updaterMap.set(clean(row?.address), row);
    }
    const originLocation = locationFromProfile(updaterMap.get(walletAddress), walletAddress);
    const roadmap = [
      originLocation,
      ...updaterAddresses
        .filter((addr) => addr !== walletAddress)
        .map((addr) => locationFromProfile(updaterMap.get(addr), addr)),
    ].filter(Boolean);
    const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, [
      {
        productName: shipmentCode,
        metadata: makeMetadata(
          dto,
          { code: shipmentCode, inventoryKey, traceSchemeRef },
          walletAddress,
          originLocation,
          roadmap,
        ),
        quantity: '1',
        receiver: walletAddress,
      },
    ]);
    return {
      result: true,
      data: unsignedTx,
      message: 'Shipment record prepared.',
      shipmentItem: {
        code: shipmentCode,
        inventoryKey,
        traceSchemeRef,
      },
    };
  }
}
