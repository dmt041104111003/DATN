import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerWalletAddress: string) {
    const addr = (ownerWalletAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    return (this.prisma as any).certification.findMany({
      where: { ownerWalletAddress: addr },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(ownerWalletAddress: string, data: {
    name?: string;
    issuer?: string | null;
    certCode?: string | null;
    validFrom?: Date | null;
    validTo?: Date | null;
    notes?: string | null;
  }) {
    const addr = (ownerWalletAddress || '').trim();
    const name = (data.name || '').trim();
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return (this.prisma as any).certification.create({
      data: {
        ownerWalletAddress: addr,
        name,
        issuer: (data.issuer || '').trim() || null,
        certCode: (data.certCode || '').trim() || null,
        validFrom: data.validFrom ?? null,
        validTo: data.validTo ?? null,
        notes: (data.notes || '').trim() || null,
      },
    });
  }

  async update(ownerWalletAddress: string, id: string, data: {
    name?: string;
    issuer?: string | null;
    certCode?: string | null;
    validFrom?: Date | null;
    validTo?: Date | null;
    notes?: string | null;
  }) {
    const addr = (ownerWalletAddress || '').trim();
    const existing = await (this.prisma as any).certification.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== addr) {
      throw new NotFoundException('Certification not found');
    }
    const updateData: any = {};
    if (typeof data.name === 'string') updateData.name = data.name.trim();
    if (data.issuer !== undefined) updateData.issuer = (data.issuer || '').trim() || null;
    if (data.certCode !== undefined) updateData.certCode = (data.certCode || '').trim() || null;
    if (data.validFrom !== undefined) updateData.validFrom = data.validFrom ?? null;
    if (data.validTo !== undefined) updateData.validTo = data.validTo ?? null;
    if (data.notes !== undefined) updateData.notes = (data.notes || '').trim() || null;

    return (this.prisma as any).certification.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(ownerWalletAddress: string, id: string) {
    const addr = (ownerWalletAddress || '').trim();
    const existing = await (this.prisma as any).certification.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== addr) {
      throw new NotFoundException('Certification not found');
    }
    await (this.prisma as any).certification.delete({ where: { id } });
    return { success: true };
  }
}

