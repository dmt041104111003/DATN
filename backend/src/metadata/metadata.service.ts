import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateMetadataDto) {
    return this.prisma.metadata.create({ data: dto });
  }

  async update(id: string, dto: UpdateMetadataDto) {
    await this.findOne(id);
    return this.prisma.metadata.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.metadata.delete({ where: { id } });
  }
}