import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';

@Injectable()
export class ProductionProcessService {
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
    const cacheKey = 'production-processes:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const processes = await this.prisma.productionProcess.findMany();
    await this.redis.set(cacheKey, processes, 300);
    return processes;
  }

  async findOne(id: string) {
    const cacheKey = `production-process:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.productionProcess.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('ProductionProcess not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.productionProcess.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('ProductionProcess not found');
    if (item.product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateProductionProcessDto) {
    await this.checkSubscriptionActive(userId);
    
    if (dto.endTime && new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('End time must be after start time');
    }
    
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');

    const process = await this.prisma.productionProcess.create({ data: dto });
    await this.redis.delMultiple([
      'production-processes:all',
      `production-processes:product:${dto.productId}`,
    ]);
    return process;
  }

  async update(id: string, userId: string, dto: UpdateProductionProcessDto) {
    await this.checkSubscriptionActive(userId);
    
    const process = await this.findOneOwned(id, userId);
    
    const startTime = dto.startTime || process.startTime;
    const endTime = dto.endTime !== undefined ? dto.endTime : process.endTime;
    
    if (endTime && new Date(endTime) <= new Date(startTime)) {
      throw new BadRequestException('End time must be after start time');
    }
    
    const updated = await this.prisma.productionProcess.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `production-process:${id}`,
      'production-processes:all',
      `production-processes:product:${process.productId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const process = await this.findOneOwned(id, userId);
    await this.prisma.productionProcess.delete({ where: { id } });
    await this.redis.delMultiple([
      `production-process:${id}`,
      'production-processes:all',
      `production-processes:product:${process.productId}`,
    ]);
  }
}
