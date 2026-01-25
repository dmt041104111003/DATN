import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAllByUser(userId: string) {
    const cacheKey = `suppliers:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const suppliers = await this.prisma.supplier.findMany({
      where: { userId },
    });
    await this.redis.set(cacheKey, suppliers, 300);
    return suppliers;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `supplier:${id}`;
    const cached = await this.redis.get<{ id: string; userId: string; name: string; location: string | null; gpsCoordinates: string | null; contactInfo: string | null; createdAt: Date; updatedAt: Date }>(cacheKey);
    if (cached && typeof cached === 'object') {
      if (cached.userId !== userId)
        throw new ForbiddenException('Not your supplier');
      return cached;
    }

    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId)
      throw new ForbiddenException('Not your supplier');

    await this.redis.set(cacheKey, supplier, 300);
    return supplier;
  }

  async create(userId: string, dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: { ...dto, userId },
    });
    await this.redis.del(`suppliers:user:${userId}`);
    return supplier;
  }

  async update(id: string, userId: string, dto: UpdateSupplierDto) {
    await this.findOne(id, userId);
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `supplier:${id}`,
      `suppliers:user:${userId}`,
    ]);
    return supplier;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.supplier.delete({ where: { id } });
    await this.redis.delMultiple([
      `supplier:${id}`,
      `suppliers:user:${userId}`,
    ]);
  }
}
