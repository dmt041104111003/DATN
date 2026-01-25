import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private subscriptionService: SubscriptionService,
  ) {}

  private async checkSubscriptionActive(userId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(userId);
    if (!subscription) {
      throw new BadRequestException(
        'Subscription has expired. Please renew to continue using this feature.',
      );
    }
    return subscription;
  }

  async findAll(userId: string) {
    const cacheKey = `warehouses:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const warehouses = await this.prisma.warehouse.findMany({
      where: { userId },
    });
    await this.redis.set(cacheKey, warehouses, 300);
    return warehouses;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `warehouse:${id}`;
    const cached = await this.redis.get<{ id: string; userId: string; name: string; location: string | null; capacity: number; createdAt: Date; updatedAt: Date }>(cacheKey);
    if (cached && typeof cached === 'object' && 'userId' in cached) {
      if (cached.userId !== userId)
        throw new ForbiddenException('Not your warehouse');
      return cached;
    }

    const item = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Warehouse not found');
    if (item.userId !== userId)
      throw new ForbiddenException('Not your warehouse');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  async create(userId: string, dto: CreateWarehouseDto) {
    await this.checkSubscriptionActive(userId);
    
    if (dto.capacity !== undefined && dto.capacity < 0) {
      throw new BadRequestException('Warehouse capacity must be greater than or equal to 0');
    }

    const warehouse = await this.prisma.warehouse.create({
      data: {
        name: dto.name,
        location: dto.location,
        capacity: dto.capacity ?? 0,
        userId,
      },
    });
    await this.redis.del(`warehouses:user:${userId}`);
    return warehouse;
  }

  async update(id: string, userId: string, dto: UpdateWarehouseDto) {
    await this.checkSubscriptionActive(userId);
    
    if (dto.capacity !== undefined && dto.capacity < 0) {
      throw new BadRequestException('Warehouse capacity must be greater than or equal to 0');
    }
    
    await this.findOne(id, userId);
    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([`warehouse:${id}`, `warehouses:user:${userId}`]);
    return warehouse;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.warehouse.delete({ where: { id } });
    await this.redis.delMultiple([`warehouse:${id}`, `warehouses:user:${userId}`]);
  }
}
