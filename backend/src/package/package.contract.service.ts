import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CIP68_100, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlutusHelper } from '../production/helpers/plutus.helper';
import { TxBuilderHelper } from '../production/helpers/tx-builder.helper';

function clean(v: unknown): string {
  return String(v ?? '').trim();
}

function decodeAssetNameFromUnit(unit: unknown) {
  const value = clean(unit);
  if (!value || value.length <= 56) return '';
  const rest = value.slice(56);
  const label = CIP68_100('');
  const hex = rest.startsWith(label) ? rest.slice(label.length) : rest;
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return '';
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

function makeMetadata(
  base: any,
  production: { code: string; inventoryKey: string; traceSchemeRef: string },
  item: { code: string; inventoryKey: string },
  holderAddress: string,
) {
  return {
    production_code: clean(production.code),
    production_inventory_key: clean(production.inventoryKey),
    package_code: clean(item.code),
    package_inventory_key: clean(item.inventoryKey),
    trace_scheme_ref: clean(production.traceSchemeRef),
    holder_address: clean(holderAddress),
    registering_custodian_address: clean(holderAddress),
    weight_value: clean(base?.weightValue),
    weight_unit: clean(base?.weightUnit),
    quantity_per_record: '1',
    requested_quantity: clean(base?.quantity),
    packaging_type: clean(base?.packagingType),
    packaging_date: clean(base?.packagingDate),
    authorized_agents: JSON.stringify(Array.isArray(base?.authorizedAgents) ? base.authorizedAgents : []),
    note: clean(base?.note),
    status: 'UNSOLD',
  } as Record<string, string>;
}

@Injectable()
export class PackageContractService {
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
    const productionInventoryKey = clean(dto?.productionInventoryKey);
    const quantity = Number(dto?.quantity);
    const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: { inventoryKey: true, code: true, traceSchemeRef: true, registeringCustodianAddress: true },
    });
    if (!production) throw new NotFoundException('Production not found.');
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const productionCode = clean(production.code);
    const traceSchemeRef = clean(production.traceSchemeRef);
    const existing = await (this.prisma as any).package.findMany({
      where: { productionInventoryKey },
      select: { code: true },
    });
    const maxIndex = (existing || []).reduce((max: number, row: any) => {
      const code = clean(row?.code);
      const prefix = `${productionCode}-`;
      if (!code.startsWith(prefix)) return max;
      const suffix = Number(code.slice(prefix.length));
      return Number.isInteger(suffix) && suffix > max ? suffix : max;
    }, 0);

    const packageItems = Array.from({ length: safeQuantity }).map((_, idx) => {
      const n = maxIndex + idx + 1;
      const code = `${productionCode}-${String(n).padStart(3, '0')}`;
      const inventoryKey = traceSchemeRef + CIP68_100(stringToHex(code));
      return { code, inventoryKey, traceSchemeRef };
    });

    const products = packageItems.map((item) => ({
      productName: item.code,
      metadata: makeMetadata(
        dto,
        {
          code: productionCode,
          inventoryKey: clean(production.inventoryKey),
          traceSchemeRef,
        },
        { code: item.code, inventoryKey: item.inventoryKey },
        walletAddress,
      ),
      quantity: '1',
      receiver: walletAddress,
    }));
    const unsignedTx = await this.txBuilderHelper.buildMintTx(walletAddress, owners, products);

    return {
      result: true,
      data: unsignedTx,
      message: 'Package records prepared.',
      packageItems,
    };
  }

  async createUnsignedBurnTx(dto: any) {
    const walletAddress = clean(dto?.custodianAddress);
    const owners = Array.isArray(dto?.owners) ? dto.owners.map(clean).filter(Boolean) : [];
    const packageInventoryKeys = Array.isArray(dto?.packageInventoryKeys)
      ? dto.packageInventoryKeys.map(clean).filter(Boolean)
      : [];
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const rows = await (this.prisma as any).package.findMany({
      where: { inventoryKey: { in: packageInventoryKeys } },
      select: { inventoryKey: true, code: true },
    });
    const products = (rows || [])
      .map((row: any) => ({ productName: clean(row?.code) }))
      .filter((x: any) => clean(x?.productName));

    const unsignedTx = await this.txBuilderHelper.buildBurnTx(walletAddress, owners, products);
    return {
      result: true,
      data: unsignedTx,
      message: 'Package burn prepared.',
    };
  }

  private async loadOnchainMetadata(owners: string[], packageInventoryKey: string) {
    const { policyId, contractAddress } = this.plutusHelper.getScripts(owners);
    const assetName = decodeAssetNameFromUnit(packageInventoryKey);
    if (!assetName) return null;
    const referenceUnit = policyId + CIP68_100(stringToHex(assetName));
    const utxos = await this.blockfrostProvider.fetchAddressUTxOs(contractAddress, referenceUnit);
    const ref = utxos.length > 0 ? (utxos[utxos.length - 1] as any) : null;
    if (!ref) return null;
    const metadata = (await this.blockfrostProvider.fetchAssetAddresses(packageInventoryKey) as any)?.onchain_metadata || {};
    return { assetName, metadata };
  }

  async createUnsignedSaveTx(dto: any) {
    const walletAddress = clean(dto?.custodianAddress);
    const owners = Array.isArray(dto?.owners) ? dto.owners.map(clean).filter(Boolean) : [];
    const inventoryKey = clean(dto?.inventoryKey);
    const metadataInput = dto?.metadata ?? {};
    if (owners.length === 0) owners.push(walletAddress);
    if (!owners.includes(walletAddress)) owners.push(walletAddress);

    const row = await (this.prisma as any).package.findUnique({
      where: { inventoryKey },
      select: { inventoryKey: true, holderAddress: true },
    });
    if (!row) throw new BadRequestException('Package not found.');

    const onchain = await this.loadOnchainMetadata(owners, inventoryKey);
    if (!onchain) throw new BadRequestException('Package on-chain metadata was not found.');
    const { assetName, metadata } = onchain;
    if (!assetName) throw new BadRequestException('Unable to decode asset name from inventoryKey.');
    const mergedMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata || {})) {
      mergedMetadata[String(key)] = stringifyMetadataValue(value);
    }
    for (const [key, value] of Object.entries(metadataInput || {})) {
      mergedMetadata[String(key)] = stringifyMetadataValue(value);
    }

    const unsignedTx = await this.txBuilderHelper.buildUpdateTx(walletAddress, owners, [
      { productName: assetName, metadata: mergedMetadata },
    ]);
    return {
      result: true,
      data: unsignedTx,
      message: 'Package save prepared.',
    };
  }
}

