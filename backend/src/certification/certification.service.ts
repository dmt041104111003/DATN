import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'certifications:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const certifications = await this.prisma.certification.findMany();
    await this.redis.set(cacheKey, certifications, 300);
    return certifications;
  }

  async findOne(id: string) {
    const cacheKey = `certification:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.certification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Certification not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.certification.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('Certification not found');
    if (item.product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateCertificationDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');

    const certification = await this.prisma.certification.create({ data: dto });
    await this.redis.delMultiple([
      'certifications:all',
      `certifications:product:${dto.productId}`,
    ]);
    return certification;
  }

  async update(id: string, userId: string, dto: UpdateCertificationDto) {
    const certification = await this.findOneOwned(id, userId);
    const updated = await this.prisma.certification.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `certification:${id}`,
      'certifications:all',
      `certifications:product:${certification.productId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const certification = await this.findOneOwned(id, userId);
    await this.prisma.certification.delete({ where: { id } });
    await this.redis.delMultiple([
      `certification:${id}`,
      'certifications:all',
      `certifications:product:${certification.productId}`,
    ]);
  }
}
