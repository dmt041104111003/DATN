import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function clean(value: unknown) {
  return String(value ?? '').trim();
}

function makeUnitCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `UNIT_${y}${m}${d}_${seq}`;
}

@Injectable()
export class UnitService {
  constructor(private readonly prisma: PrismaService) {}

  async list(createdByAddress: string) {
    const owner = clean(createdByAddress);
    if (!owner) throw new BadRequestException('Operator account reference is required.');
    return (this.prisma as any).unit.findMany({
      where: { createdByAddress: owner },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string, createdByAddress: string) {
    const owner = clean(createdByAddress);
    const row = await (this.prisma as any).unit.findUnique({ where: { id } });
    if (!row || clean(row.createdByAddress) !== owner) {
      throw new NotFoundException('Unit not found');
    }
    return row;
  }

  async create(createdByAddress: string, data: any) {
    const owner = clean(createdByAddress);
    if (!owner) throw new BadRequestException('Operator account reference is required.');

    const code = clean(data?.code) || makeUnitCode();
    const name = clean(data?.name);
    const unitType = clean(data?.unitType).toUpperCase();
    const walletAddress = clean(data?.walletAddress);
    const provinceId = clean(data?.provinceId);
    const districtId = clean(data?.districtId);
    const wardId = clean(data?.wardId);

    if (!name) throw new BadRequestException('name is required.');
    if (!['TRANSIT', 'AGENT'].includes(unitType)) throw new BadRequestException('unitType is invalid.');
    if (!walletAddress) throw new BadRequestException('walletAddress is required.');
    if (!provinceId || !districtId || !wardId) {
      throw new BadRequestException('provinceId, districtId, wardId are required.');
    }

    try {
      return await (this.prisma as any).unit.create({
        data: {
          code,
          name,
          unitType,
          walletAddress,
          provinceId,
          districtId,
          wardId,
          phoneNumber: clean(data?.phoneNumber) || null,
          createdByAddress: owner,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('walletAddress/code already exists.');
      }
      throw error;
    }
  }

  async update(id: string, createdByAddress: string, data: any) {
    const owner = clean(createdByAddress);
    const existing = await (this.prisma as any).unit.findUnique({ where: { id } });
    if (!existing || clean(existing.createdByAddress) !== owner) {
      throw new NotFoundException('Unit not found');
    }

    const patch: Record<string, unknown> = {};
    if (data?.name !== undefined) patch.name = clean(data.name) || null;
    if (data?.unitType !== undefined) {
      const unitType = clean(data.unitType).toUpperCase();
      if (!['TRANSIT', 'AGENT'].includes(unitType)) throw new BadRequestException('unitType is invalid.');
      patch.unitType = unitType;
    }
    if (data?.provinceId !== undefined) patch.provinceId = clean(data.provinceId) || null;
    if (data?.districtId !== undefined) patch.districtId = clean(data.districtId) || null;
    if (data?.wardId !== undefined) patch.wardId = clean(data.wardId) || null;
    if (data?.phoneNumber !== undefined) patch.phoneNumber = clean(data.phoneNumber) || null;
    // walletAddress + code are intentionally immutable after create
    if (patch.provinceId === null || patch.districtId === null || patch.wardId === null) {
      throw new BadRequestException('provinceId, districtId, wardId are required.');
    }
    if (patch.name === null) throw new BadRequestException('name is required.');

    return (this.prisma as any).unit.update({
      where: { id },
      data: patch,
    });
  }

  async remove(id: string, createdByAddress: string) {
    const owner = clean(createdByAddress);
    const existing = await (this.prisma as any).unit.findUnique({ where: { id } });
    if (!existing || clean(existing.createdByAddress) !== owner) {
      throw new NotFoundException('Unit not found');
    }
    await (this.prisma as any).unit.delete({ where: { id } });
    return { success: true };
  }
}
