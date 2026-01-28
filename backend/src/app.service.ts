import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis/redis.service';
@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getUsers() {
    const cacheKey = 'users:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const users = await this.prisma.user.findMany();
    await this.redis.set(cacheKey, users, 300);
    return users;
  }
}
