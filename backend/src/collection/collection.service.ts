import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
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

  async findAll() {
    const cacheKey = 'collections:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const collections = await this.prisma.collection.findMany();
    await this.redis.set(cacheKey, collections, 300);
    return collections;
  }

  async findAllByUser(userId: string) {
    const cacheKey = `collections:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const collections = await this.prisma.collection.findMany({
      where: { userId },
    });
    await this.redis.set(cacheKey, collections, 300);
    return collections;
  }

  async findOne(id: string) {
    const cacheKey = `collection:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.collection.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Collection not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.findOne(id);
    if (!item || typeof item === 'string' || item.userId !== userId)
      throw new ForbiddenException('Not your collection');
    return item;
  }

  async create(userId: string, dto: CreateCollectionDto) {
    await this.checkSubscriptionActive(userId);
    const collection = await this.prisma.collection.create({
      data: { ...dto, userId },
    });
    await this.redis.delMultiple([
      'collections:all',
      `collections:user:${userId}`,
    ]);
    return collection;
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    await this.checkSubscriptionActive(userId);
    await this.findOneOwned(id, userId);
    const collection = await this.prisma.collection.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `collection:${id}`,
      'collections:all',
      `collections:user:${userId}`,
    ]);
    return collection;
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.collection.delete({ where: { id } });
    await this.redis.delMultiple([
      `collection:${id}`,
      'collections:all',
      `collections:user:${userId}`,
    ]);
  }
}
