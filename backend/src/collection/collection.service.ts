import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany();
  }

  async findAllByUser(userId: string) {
    return this.prisma.collection.findMany({ where: { userId } });
  }

  async findOne(id: string) {
    const item = await this.prisma.collection.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Collection not found');
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.findOne(id);
    if (item.userId !== userId)
      throw new ForbiddenException('Not your collection');
    return item;
  }

  async create(userId: string, dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.collection.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.collection.delete({ where: { id } });
  }
}
