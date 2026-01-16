import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';

@Injectable()
export class ProductionProcessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productionProcess.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.productionProcess.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('ProductionProcess not found');
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.productionProcess.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('ProductionProcess not found');
    if (item.product.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateProductionProcessDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException('Not your product');
    
    return this.prisma.productionProcess.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateProductionProcessDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.productionProcess.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.productionProcess.delete({ where: { id } });
  }
}