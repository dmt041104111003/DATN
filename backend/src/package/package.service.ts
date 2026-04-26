import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

function isValidWalletAddress(value: string): boolean {
  return /^addr1[0-9a-z]+$/.test(value) || /^addr_test1[0-9a-z]+$/.test(value);
}

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  async list(createdByAddress: string) {
    const owner = clean(createdByAddress);
    if (!owner) throw new BadRequestException('Operator account reference is required.');

    return (this.prisma as any).package.findMany({
      where: {
        production: {
          registeringCustodianAddress: owner,
        },
      },
      include: {
        production: {
          select: { code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBulk(createdByAddress: string, data: any) {
    const owner = clean(createdByAddress);
    if (!owner) throw new BadRequestException('Operator account reference is required.');

    const productionInventoryKey = clean(data?.productionInventoryKey);
    if (!productionInventoryKey) throw new BadRequestException('productionInventoryKey is required.');

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: {
        inventoryKey: true,
        code: true,
        traceSchemeRef: true,
        registeringCustodianAddress: true,
      },
    });
    if (!production) throw new NotFoundException('Production not found.');
    if (clean(production.registeringCustodianAddress) !== owner) {
      throw new BadRequestException('You are not allowed to package this production.');
    }

    const weightValue = Number(data?.weightValue);
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      throw new BadRequestException('weightValue must be greater than 0.');
    }

    const weightUnit = clean(data?.weightUnit).toLowerCase();
    const weightUnitOther = clean(data?.weightUnitOther);
    if (!weightUnit) throw new BadRequestException('weightUnit is required.');
    if (weightUnit === 'other' && !weightUnitOther) {
      throw new BadRequestException('weightUnitOther is required when weightUnit = other.');
    }

    const quantity = Number(data?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      throw new BadRequestException('quantity must be an integer between 1 and 5.');
    }

    const packagingType = clean(data?.packagingType);
    if (!packagingType) throw new BadRequestException('packagingType is required.');

    const packagingDate = data?.packagingDate ? new Date(data.packagingDate) : null;
    if (!packagingDate || Number.isNaN(packagingDate.getTime())) {
      throw new BadRequestException('packagingDate is required.');
    }

    const agents = Array.isArray(data?.authorizedAgents)
      ? data.authorizedAgents.map((x: unknown) => clean(x)).filter(Boolean)
      : [];
    if (agents.length < 1) {
      throw new BadRequestException('authorizedAgents requires at least one wallet address.');
    }
    const uniqueAgents = Array.from(new Set(agents));
    if (uniqueAgents.length !== agents.length) {
      throw new BadRequestException('authorizedAgents contains duplicated wallet address.');
    }
    if (!uniqueAgents.every(isValidWalletAddress)) {
      throw new BadRequestException('authorizedAgents contains invalid wallet address format.');
    }

    const productionCode = clean(production.code);
    const traceSchemeRef = clean(production.traceSchemeRef);
    if (!productionCode || !traceSchemeRef) {
      throw new BadRequestException('Production code/policy is missing.');
    }
    const txHash = clean(data?.txHash);
    if (!txHash) {
      throw new BadRequestException('txHash is required.');
    }

    const packageItems = Array.isArray(data?.packageItems) ? data.packageItems : [];
    if (packageItems.length !== quantity) {
      throw new BadRequestException('packageItems size must match quantity.');
    }

    const note = clean(data?.note) || null;
    const created: any[] = [];

    for (const item of packageItems) {
      const code = clean(item?.code);
      const inventoryKey = clean(item?.inventoryKey);
      const itemTraceSchemeRef = clean(item?.traceSchemeRef) || traceSchemeRef;
      if (!code || !inventoryKey) {
        throw new BadRequestException('packageItems are invalid.');
      }
      const row = await (this.prisma as any).package.create({
        data: {
          traceSchemeRef: itemTraceSchemeRef,
          inventoryKey,
          code,
          registeringCustodianAddress: owner,
          productionInventoryKey,
          weightValue,
          weightUnit,
          weightUnitOther: weightUnit === 'other' ? weightUnitOther : null,
          quantity,
          packagingType,
          packagingDate,
          note,
          authorizedAgents: uniqueAgents as any,
          status: 'UNSOLD',
        } as any,
      });
      await (this.prisma as any).recordOperation.create({
        data: {
          entityType: 'PACKAGE',
          entityKey: inventoryKey,
          opType: 'CREATE',
          txHash,
          verified: false,
          verifiedAt: null,
        } as any,
      });
      created.push(row);
    }

    return created;
  }
}

