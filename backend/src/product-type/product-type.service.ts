import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerWalletAddress: string) {
    const addr = (ownerWalletAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    return (this.prisma as any).productType.findMany({
      where: { ownerWalletAddress: addr },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(ownerWalletAddress: string, data: { name?: string; code?: string | null }) {
    const addr = (ownerWalletAddress || '').trim();
    const name = (data.name || '').trim();
    const code = (data.code || '').trim() || null;
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return (this.prisma as any).productType.create({
      data: { ownerWalletAddress: addr, name, code },
    });
  }

  async update(ownerWalletAddress: string, id: string, data: { name?: string; code?: string | null }) {
    const addr = (ownerWalletAddress || '').trim();
    const existing = await (this.prisma as any).productType.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== addr) {
      throw new NotFoundException('Product type not found');
    }
    const updateData: any = {};
    if (typeof data.name === 'string') updateData.name = data.name.trim();
    if (data.code !== undefined) updateData.code = (data.code || '').trim() || null;
    return (this.prisma as any).productType.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(ownerWalletAddress: string, id: string) {
    const addr = (ownerWalletAddress || '').trim();
    const existing = await (this.prisma as any).productType.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== addr) {
      throw new NotFoundException('Product type not found');
    }
    await (this.prisma as any).productType.delete({ where: { id } });
    return { success: true };
  }
}

