import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function makeCode() {
  return `DVLK_${Date.now()}`;
}

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(row: any) {
    return {
      ...row,
      id: row?.id,
    };
  }

  async list(createdBy: string) {
    const addr = cleanString(createdBy);
    const rows = await (this.prisma as any).partner.findMany({
      where: { registeringCustodianAddress: addr },
      orderBy: { createdAt: 'desc' },
    });
    return (rows || []).map((x: any) => this.toResponse(x));
  }

  async getOne(createdBy: string, idRaw: unknown) {
    const addr = cleanString(createdBy);
    const id = cleanString(idRaw);
    const row = await (this.prisma as any).partner.findFirst({
      where: { id, registeringCustodianAddress: addr },
    });
    if (!row) throw new NotFoundException('Partner not found');
    return this.toResponse(row);
  }

  async create(createdBy: string, data: any) {
    const addr = cleanString(createdBy);
    const row = await (this.prisma as any).partner.create({
      data: {
        code: cleanString(data?.code) || makeCode(),
        displayName: cleanString(data?.displayName),
        walletAddress: cleanString(data?.walletAddress),
        registeringCustodianAddress: addr,
        provinceId: cleanString(data?.provinceId) || null,
        districtId: cleanString(data?.districtId) || null,
        wardId: cleanString(data?.wardId) || null,
        note: cleanString(data?.note) || null,
      } as any,
    });
    return this.toResponse(row);
  }

  async update(createdBy: string, idRaw: unknown, data: any) {
    const addr = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).partner.findFirst({
      where: { id, registeringCustodianAddress: addr },
    });
    if (!existing) throw new NotFoundException('Partner not found');

    const row = await (this.prisma as any).partner.update({
      where: { id },
      data: {
        displayName: data?.displayName !== undefined ? cleanString(data?.displayName) : undefined,
        walletAddress: data?.walletAddress !== undefined ? cleanString(data?.walletAddress) : undefined,
        provinceId: data?.provinceId !== undefined ? cleanString(data?.provinceId) || null : undefined,
        districtId: data?.districtId !== undefined ? cleanString(data?.districtId) || null : undefined,
        wardId: data?.wardId !== undefined ? cleanString(data?.wardId) || null : undefined,
        note: data?.note !== undefined ? cleanString(data?.note) || null : undefined,
      } as any,
    });
    return this.toResponse(row);
  }

  async remove(createdBy: string, idRaw: unknown) {
    const addr = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).partner.findFirst({
      where: { id, registeringCustodianAddress: addr },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Partner not found');
    await (this.prisma as any).partner.delete({ where: { id } });
    return { id };
  }
}

