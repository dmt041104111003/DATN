import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'documents:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const documents = await this.prisma.document.findMany();
    await this.redis.set(cacheKey, documents, 300);
    return documents;
  }

  async findOne(id: string) {
    const cacheKey = `document:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.document.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Document not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.document.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('Document not found');
    if (item.product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }
  async create(userId: string, dto: CreateDocumentDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');

    const document = await this.prisma.document.create({ data: dto });
    await this.redis.delMultiple([
      'documents:all',
      `documents:product:${dto.productId}`,
    ]);
    return document;
  }

  async update(id: string, userId: string, dto: UpdateDocumentDto) {
    const document = await this.findOneOwned(id, userId);
    const updated = await this.prisma.document.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `document:${id}`,
      'documents:all',
      `documents:product:${document.productId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const document = await this.findOneOwned(id, userId);
    await this.prisma.document.delete({ where: { id } });
    await this.redis.delMultiple([
      `document:${id}`,
      'documents:all',
      `documents:product:${document.productId}`,
    ]);
  }
}
