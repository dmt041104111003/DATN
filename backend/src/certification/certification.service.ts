import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { hashCertification } from '../utils/hash.util';

@Injectable()
export class CertificationService {
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
    await this.checkSubscriptionActive(userId);
    
    if (dto.expiryDate && new Date(dto.expiryDate) <= new Date(dto.issueDate)) {
      throw new BadRequestException('Expiry date must be after issue date');
    }
    
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');

    const certHash = hashCertification(
      dto.certName,
      dto.issueDate,
      dto.expiryDate,
    );

    const certification = await this.prisma.certification.create({
      data: {
        ...dto,
        certHash,
        issueDate: new Date(dto.issueDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
    await this.redis.delMultiple([
      'certifications:all',
      `certifications:product:${dto.productId}`,
    ]);
    return certification;
  }

  async update(id: string, userId: string, dto: UpdateCertificationDto) {
    await this.checkSubscriptionActive(userId);
    
    const certification = await this.findOneOwned(id, userId);
    
    const issueDate = dto.issueDate ? new Date(dto.issueDate) : certification.issueDate;
    const expiryDate = dto.expiryDate !== undefined ? (dto.expiryDate ? new Date(dto.expiryDate) : null) : certification.expiryDate;
    
    if (expiryDate && expiryDate <= issueDate) {
      throw new BadRequestException('Expiry date must be after issue date');
    }
    
    const certName = dto.certName || certification.certName;
    const certHash = hashCertification(
      certName,
      issueDate,
      expiryDate,
    );
    
    const updated = await this.prisma.certification.update({
      where: { id },
      data: {
        ...dto,
        certHash,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate !== undefined ? (dto.expiryDate ? new Date(dto.expiryDate) : null) : undefined,
      },
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
