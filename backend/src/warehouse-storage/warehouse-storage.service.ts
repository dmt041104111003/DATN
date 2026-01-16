import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateWarehouseStorageDto) {
    return this.prisma.warehouseStorage.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarehouseStorageDto) {
    await this.findOne(id);
    return this.prisma.warehouseStorage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.warehouseStorage.delete({ where: { id } });
  }
}