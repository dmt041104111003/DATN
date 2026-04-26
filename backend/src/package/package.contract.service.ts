import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CIP68_100, stringToHex, BlockfrostProvider } from '@meshsdk/core';
import { PrismaService } from '../prisma/prisma.service';
import { PlutusHelper } from '../production/helpers/plutus.helper';
import { TxBuilderHelper } from '../production/helpers/tx-builder.helper';

function clean(v: unknown): string {
  return String(v ?? '').trim();
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
    if (!walletAddress) throw new BadRequestException('custodianAddress is required.');
    if (!productionInventoryKey) throw new BadRequestException('productionInventoryKey is required.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      throw new BadRequestException('quantity must be between 1 and 5.');
    }

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: { inventoryKey: true, code: true, traceSchemeRef: true, registeringCustodianAddress: true },
    });
    if (!production) throw new NotFoundException('Production not found.');
    if (clean(production.registeringCustodianAddress) !== walletAddress) {
      throw new BadRequestException('You are not allowed to package this production.');
    }
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

    const packageItems = Array.from({ length: quantity }).map((_, idx) => {
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
}

