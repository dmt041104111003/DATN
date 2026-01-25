import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

@Injectable()
export class MetadataService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'metadata:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const metadata = await this.prisma.metadata.findMany();
    await this.redis.set(cacheKey, metadata, 300);
    return metadata;
  }

  async findOne(id: string) {
    const cacheKey = `metadata:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.metadata.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Metadata not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.metadata.findUnique({
      where: { id },
      include: { collection: true },
    });
    if (!item) throw new NotFoundException('Metadata not found');
    if (item.collection.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }
  async create(userId: string, dto: CreateMetadataDto) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: dto.collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId)
      throw new ForbiddenException('Not your collection');

    const metadata = await this.prisma.metadata.create({ data: dto });
    await this.redis.delMultiple([
      'metadata:all',
      `metadata:collection:${dto.collectionId}`,
    ]);
    return metadata;
  }

  async update(id: string, userId: string, dto: UpdateMetadataDto) {
    const metadata = await this.findOneOwned(id, userId);
    const updated = await this.prisma.metadata.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([
      `metadata:${id}`,
      'metadata:all',
      `metadata:collection:${metadata.collectionId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const metadata = await this.findOneOwned(id, userId);
    await this.prisma.metadata.delete({ where: { id } });
    await this.redis.delMultiple([
      `metadata:${id}`,
      'metadata:all',
      `metadata:collection:${metadata.collectionId}`,
    ]);
  }
}
