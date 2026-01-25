import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';

@Injectable()
export class ProductionProcessService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

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
    const process = await this.findOneOwned(id, userId);
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
