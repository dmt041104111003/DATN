import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async list(createdBy: string) {
    const custodian = cleanString(createdBy);
    return await (this.prisma as any).warehouse.findMany({
      where: { registeringCustodianAddress: custodian },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createdBy: string, data: any) {
    const custodian = cleanString(createdBy);
    const existing = await (this.prisma as any).warehouse.findFirst({
      where: { registeringCustodianAddress: custodian },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'Tài khoản đã có kho. Chỉnh sửa kho hiện có hoặc tạo kho khi đăng ký.',
      );
    }
    return await (this.prisma as any).warehouse.create({
      data: {
        name: cleanString(data?.name),
        location: cleanString(data?.location),
        capacity: cleanString(data?.capacity),
        registeringCustodianAddress: custodian,
      } as any,
    });
  }

  async update(createdBy: string, idRaw: unknown, data: any) {
    const custodian = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).warehouse.findFirst({
      where: { id, registeringCustodianAddress: custodian },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy kho.');
    return await (this.prisma as any).warehouse.update({
      where: { id },
      data: {
        name: data?.name !== undefined ? cleanString(data?.name) : undefined,
        location: data?.location !== undefined ? cleanString(data?.location) : undefined,
        capacity: data?.capacity !== undefined ? cleanString(data?.capacity) : undefined,
      } as any,
    });
  }

  async remove(createdBy: string, idRaw: unknown) {
    const custodian = cleanString(createdBy);
    const id = cleanString(idRaw);
    const existing = await (this.prisma as any).warehouse.findFirst({
      where: { id, registeringCustodianAddress: custodian },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy kho.');
    await (this.prisma as any).warehouse.delete({ where: { id } });
    return { id };
  }
}

