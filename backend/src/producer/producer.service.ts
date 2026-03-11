import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProducerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerWalletAddress: string) {
    const addr = (ownerWalletAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    return (this.prisma as any).producer.findMany({
      where: { ownerWalletAddress: addr },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    ownerWalletAddress: string,
    data: { name?: string; code?: string | null; location?: string | null; notes?: string | null },
  ) {
    const addr = (ownerWalletAddress || '').trim();
    const name = (data.name || '').trim();
    const code = (data.code || '').trim() || null;
    const location = (data.location || '').trim() || null;
    const notes = (data.notes || '').trim() || null;
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return (this.prisma as any).producer.create({
      data: { ownerWalletAddress: addr, name, code, location, notes },
    });
  }

  async update(
    ownerWalletAddress: string,
    id: string,
    data: { name?: string; code?: string | null; location?: string | null; notes?: string | null },
  ) {
    const addr = (ownerWalletAddress || '').trim();
    const producer = await (this.prisma as any).producer.findUnique({
      where: { id },
    });
    if (!producer || producer.ownerWalletAddress !== addr) {
      throw new NotFoundException('Producer not found');
    }
    const updateData: any = {};
    if (typeof data.name === 'string') updateData.name = data.name.trim();
    if (data.code !== undefined) updateData.code = (data.code || '').trim() || null;
    if (data.location !== undefined) updateData.location = (data.location || '').trim() || null;
    if (data.notes !== undefined) updateData.notes = (data.notes || '').trim() || null;
    return (this.prisma as any).producer.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(ownerWalletAddress: string, id: string) {
    const addr = (ownerWalletAddress || '').trim();
    const producer = await (this.prisma as any).producer.findUnique({
      where: { id },
    });
    if (!producer || producer.ownerWalletAddress !== addr) {
      throw new NotFoundException('Producer not found');
    }
    await (this.prisma as any).producer.delete({ where: { id } });
    return { success: true };
  }
}

