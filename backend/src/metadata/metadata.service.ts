import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.metadata.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.metadata.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Metadata not found');
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.metadata.findUnique({
      where: { id },
      include: { collection: true },
    });
    if (!item) throw new NotFoundException('Metadata not found');
    if (item.collection.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }
  async create(userId: string, dto: CreateMetadataDto) {
    const collection = await this.prisma.collection.findUnique({ where: { id: dto.collectionId } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException('Not your collection');
    
    return this.prisma.metadata.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateMetadataDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.metadata.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.metadata.delete({ where: { id } });
  }
}