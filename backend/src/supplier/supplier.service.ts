import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.supplier.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId) throw new ForbiddenException('Not your supplier');
    return supplier;
  }

  async create(userId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateSupplierDto) {
    await this.findOne(id, userId);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  // Xóa user
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.supplier.delete({ where: { id } });
  }
}