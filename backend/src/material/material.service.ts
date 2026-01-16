import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.material.findMany({
      where: {
        supplier: { userId },
      },
      include: { supplier: true },
    });
  }

  async findBySupplier(supplierId: string, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId) throw new ForbiddenException('Not your supplier');
    
    return this.prisma.material.findMany({ where: { supplierId } });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.material.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!item) throw new NotFoundException('Material not found');
    if (item.supplier.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateMaterialDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId) throw new ForbiddenException('Not your supplier');
    return this.prisma.material.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateMaterialDto) {
    await this.findOne(id, userId);
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.material.delete({ where: { id } });
  }
}