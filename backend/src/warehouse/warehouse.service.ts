import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'warehouses:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const warehouses = await this.prisma.warehouse.findMany();
    await this.redis.set(cacheKey, warehouses, 300);
    return warehouses;
  }

  async findOne(id: string) {
    const cacheKey = `warehouse:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Warehouse not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  async create(dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        name: dto.name,
        location: dto.location,
        capacity: dto.capacity ?? 0,
      },
    });
    await this.redis.del('warehouses:all');
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([`warehouse:${id}`, 'warehouses:all']);
    return warehouse;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.warehouse.delete({ where: { id } });
    await this.redis.delMultiple([`warehouse:${id}`, 'warehouses:all']);
  }
}
