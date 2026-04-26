import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

function toKg(weightValue: number, unitRaw: string, quantity: number): number | null {
  const unit = clean(unitRaw).toLowerCase();
  if (!Number.isFinite(weightValue) || weightValue <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }
  if (unit === 'kg') return weightValue * quantity;
  if (unit === 'gram') return (weightValue * quantity) / 1000;
  return null;
}

function isValidWalletAddress(value: string): boolean {
  return /^addr1[0-9a-z]+$/.test(value) || /^addr_test1[0-9a-z]+$/.test(value);
}

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  async getCapacity(createdByAddress: string, productionInventoryKeyRaw: unknown) {
    const owner = clean(createdByAddress);
    const productionInventoryKey = clean(productionInventoryKeyRaw);
    if (!owner) throw new BadRequestException('Operator account reference is required.');
    if (!productionInventoryKey) throw new BadRequestException('productionInventoryKey is required.');

    const production = await (this.prisma as any).production.findUnique({
      where: { inventoryKey: productionInventoryKey },
      select: {
        inventoryKey: true,
        code: true,
        status: true,
        actualYieldKg: true,
        registeringCustodianAddress: true,
      },
    });
    if (!production) throw new NotFoundException('Production not found.');
    if (clean(production.registeringCustodianAddress) !== owner) {
      throw new BadRequestException('You are not allowed to package this production.');
    }
    const status = clean(production.status).toUpperCase();
    const totalYieldKg = Number(clean(production.actualYieldKg));
    if (status !== 'CLOSED') {
      return {
        productionInventoryKey,
        status,
        totalYieldKg: Number.isFinite(totalYieldKg) && totalYieldKg > 0 ? totalYieldKg : 0,
        packagedKg: 0,
        remainingKg: 0,
        canPackage: false,
        message: 'Production must be CLOSED before packaging.',
      };
    }
    if (!Number.isFinite(totalYieldKg) || totalYieldKg <= 0) {
      return {
        productionInventoryKey,
        status,
        totalYieldKg: 0,
        packagedKg: 0,
        remainingKg: 0,
        canPackage: false,
        message: 'actualYieldKg is missing or invalid.',
      };
    }

    const existing = await (this.prisma as any).package.findMany({
      where: { productionInventoryKey },
      select: { weightValue: true, weightUnit: true, quantity: true },
    });
    let packagedKg = 0;
    for (const row of existing || []) {
      const kg = toKg(Number(row?.weightValue), clean(row?.weightUnit), Number(row?.quantity));
      if (kg === null) {
        return {
          productionInventoryKey,
          status,
          totalYieldKg,
          packagedKg,
          remainingKg: Math.max(totalYieldKg - packagedKg, 0),
          canPackage: false,
          message: 'Found package with unsupported weight unit; cannot calculate remaining yield.',
        };
      }
      packagedKg += kg;
    }
    const remainingKg = Math.max(totalYieldKg - packagedKg, 0);
    return {
      productionInventoryKey,
      status,
      totalYieldKg,
      packagedKg,
      remainingKg,
      canPackage: remainingKg > 0,
      message: remainingKg > 0 ? 'OK' : 'No remaining yield to package.',
    };
  }

  async list(createdByAddress: string) {
    const owner = clean(createdByAddress);
    if (!owner) throw new BadRequestException('Operator account reference is required.');

    return (this.prisma as any).package.findMany({
      where: {
        production: {
          registeringCustodianAddress: owner,
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
        status: true,
        actualYieldKg: true,
        registeringCustodianAddress: true,
      },
    });
    if (!production) throw new NotFoundException('Production not found.');
    if (clean(production.registeringCustodianAddress) !== owner) {
      throw new BadRequestException('You are not allowed to package this production.');
    }
    if (clean(production.status).toUpperCase() !== 'CLOSED') {
      throw new BadRequestException('Production must be CLOSED before packaging.');
    }

    const weightValue = Number(data?.weightValue);
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      throw new BadRequestException('weightValue must be greater than 0.');
    }

    const weightUnit = clean(data?.weightUnit).toLowerCase();
    if (!weightUnit) throw new BadRequestException('weightUnit is required.');
    if (weightUnit !== 'kg' && weightUnit !== 'gram') {
      throw new BadRequestException('weightUnit must be kg or gram.');
    }

    const quantity = Number(data?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      throw new BadRequestException('quantity must be an integer between 1 and 5.');
    }
    const requestKg = toKg(weightValue, weightUnit, quantity);
    if (requestKg === null) {
      throw new BadRequestException('Only kg/gram are supported for remaining-yield validation.');
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

    const traceSchemeRef = clean(production.traceSchemeRef);
    if (!traceSchemeRef) {
      throw new BadRequestException('Production code/policy is missing.');
    }
    const totalYieldKg = Number(clean(production.actualYieldKg));
    if (!Number.isFinite(totalYieldKg) || totalYieldKg <= 0) {
      throw new BadRequestException('actualYieldKg is missing or invalid.');
    }
    const capacity = await this.getCapacity(owner, productionInventoryKey);
    const remainingKg = Number(capacity?.remainingKg || 0);
    if (!Number.isFinite(remainingKg) || remainingKg <= 0) {
      throw new BadRequestException('No remaining yield to package.');
    }
    if (requestKg > remainingKg + 1e-9) {
      throw new BadRequestException(`Packaging exceeds remaining yield (${remainingKg.toFixed(3)} kg left).`);
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
          weightUnitOther: null,
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

