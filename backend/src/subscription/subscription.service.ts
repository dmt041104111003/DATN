import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subscription.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Subscription not found');
    return item;
  }

  async create(dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({ data: dto });
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id);
    return this.prisma.subscription.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subscription.delete({ where: { id } });
  }
}