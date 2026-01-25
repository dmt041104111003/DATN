import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ServiceService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'services:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const services = await this.prisma.service.findMany();
    await this.redis.set(cacheKey, services, 1800);
    return services;
  }

  async findOne(id: string) {
    const cacheKey = `service:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.service.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Service not found');

    await this.redis.set(cacheKey, item, 1800);
    return item;
  }
}
