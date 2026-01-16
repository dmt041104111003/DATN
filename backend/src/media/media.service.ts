import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.media.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Media not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your media');
    return item;
  }

  async create(userId: string, dto: CreateMediaDto) {
    return this.prisma.media.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateMediaDto) {
    await this.findOne(id, userId);
    return this.prisma.media.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.media.delete({ where: { id } });
  }
}