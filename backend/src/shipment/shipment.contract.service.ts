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

function decodeAssetNameFromUnit(unit: unknown) {
  const value = clean(unit);
  if (!value) return '';
  const dot = value.indexOf('.');
  const hex = dot >= 0 ? value.slice(dot + 1) : value;
  if (!hex) return '';
  try {
    return Buffer.from(hex, 'hex').toString('utf8');
  } catch {
    return '';
  }
}

function stringifyMetadataValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
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

  private async loadOnchainMetadata(walletAddress: string, shipmentInventoryKey: string) {
    const own = await this.blockfrostProvider.fetchAddressUTxOs(walletAddress);
    const utxo = (own || []).find((item: any) =>
      Array.isArray(item?.output?.amount) &&
      item.output.amount.some((amt: any) => clean(amt?.unit) === shipmentInventoryKey),
    );
    if (!utxo) throw new BadRequestException('Cannot find shipment token UTxO in wallet.');
    const token = (utxo.output.amount || []).find((amt: any) => clean(amt?.unit) === shipmentInventoryKey);
    const asset = await this.blockfrostProvider.fetchAssetAddresses(shipmentInventoryKey);
    const metadata = (asset as any)?.onchain_metadata || {};
    const assetName = decodeAssetNameFromUnit(token?.unit || shipmentInventoryKey);
    return { assetName, metadata };
  }

  async createUnsignedSaveTx(dto: any) {
    const walletAddress = clean(dto?.custodianAddress);
    const owners = Array.isArray(dto?.owners) ? dto.owners.map(clean).filter(Boolean) : [];
    const inventoryKey = clean(dto?.inventoryKey);
    const metadataInput = dto?.metadata ?? {};
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (!inventoryKey) throw new BadRequestException('inventoryKey is required.');
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);
    const shipment = await (this.prisma as any).shipment.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true, holderAddress: true },
    });
    if (!shipment) throw new BadRequestException('Shipment not found.');
    if (clean(shipment?.holderAddress) !== walletAddress) {
      throw new BadRequestException('You can only update shipment(s) that you still hold.');
    }
    const { assetName, metadata } = await this.loadOnchainMetadata(walletAddress, inventoryKey);
    const mergedMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata || {})) {
      mergedMetadata[String(key)] = stringifyMetadataValue(value);
    }
    for (const [key, value] of Object.entries(metadataInput || {})) {
      mergedMetadata[String(key)] = stringifyMetadataValue(value);
    }
    mergedMetadata.status = clean(metadataInput?.status) || clean(mergedMetadata.status) || 'IN_TRANSIT';
    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: assetName, metadata: mergedMetadata },
    ]);
    return { result: true, data: unsignedTx, message: 'Shipment save prepared.' };
  }

  async createUnsignedBurnTx(dto: any) {
    const walletAddress = clean(dto?.custodianAddress);
    const owners = Array.isArray(dto?.owners) ? dto.owners.map(clean).filter(Boolean) : [];
    const shipmentInventoryKeys = Array.isArray(dto?.shipmentInventoryKeys)
      ? dto.shipmentInventoryKeys.map(clean).filter(Boolean)
      : [];
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (shipmentInventoryKeys.length < 1) throw new BadRequestException('shipmentInventoryKeys is required.');
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const rows = await (this.prisma as any).shipment.findMany({
      where: { inventoryKey: { in: shipmentInventoryKeys }, holderAddress: walletAddress },
      select: { inventoryKey: true, code: true },
    });
    if ((rows || []).length !== shipmentInventoryKeys.length) {
      throw new BadRequestException('Some shipments are invalid or not held by your address.');
    }
    const products = (rows || [])
      .map((row: any) => ({ productName: clean(row?.code) }))
      .filter((x: any) => clean(x?.productName));
    if (products.length !== shipmentInventoryKeys.length) {
      throw new BadRequestException('Some shipment codes are missing for burn.');
    }

    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
    return {
      result: true,
      data: unsignedTx,
      message: 'Shipment burn prepared.',
    };
  }
}
