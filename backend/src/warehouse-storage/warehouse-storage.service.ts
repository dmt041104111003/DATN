import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateWarehouseStorageDto } from './dto/create-warehouse-storage.dto';
import { UpdateWarehouseStorageDto } from './dto/update-warehouse-storage.dto';

@Injectable()
export class WarehouseStorageService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'warehouse-storages:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const storages = await this.prisma.warehouseStorage.findMany();
    await this.redis.set(cacheKey, storages, 300);
    return storages;
  }

  async findOne(id: string) {
    const cacheKey = `warehouse-storage:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.warehouseStorage.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('WarehouseStorage not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.warehouseStorage.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('WarehouseStorage not found');
    if (item.product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateWarehouseStorageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const storage = await this.prisma.warehouseStorage.create({ data: dto });
    await this.redis.delMultiple([
      'warehouse-storages:all',
      `warehouse-storages:product:${dto.productId}`,
      `warehouse-storages:warehouse:${dto.warehouseId}`,
    ]);
    return storage;
  }

  async update(id: string, userId: string, dto: UpdateWarehouseStorageDto) {
    const storage = await this.findOneOwned(id, userId);
    const updated = await this.prisma.warehouseStorage.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `warehouse-storage:${id}`,
      'warehouse-storages:all',
      `warehouse-storages:product:${storage.productId}`,
      `warehouse-storages:warehouse:${storage.warehouseId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const storage = await this.findOneOwned(id, userId);
    await this.prisma.warehouseStorage.delete({ where: { id } });
    await this.redis.delMultiple([
      `warehouse-storage:${id}`,
      'warehouse-storages:all',
      `warehouse-storages:product:${storage.productId}`,
      `warehouse-storages:warehouse:${storage.warehouseId}`,
    ]);
  }
}
