import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';

@Injectable()
export class WarehouseStorageService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.warehouseStorage.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.warehouseStorage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('WarehouseStorage not found');
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.warehouseStorage.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('WarehouseStorage not found');
    if (item.product.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateWarehouseStorageDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException('Not your product');
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    
    return this.prisma.warehouseStorage.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateWarehouseStorageDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.warehouseStorage.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.warehouseStorage.delete({ where: { id } });
  }
}