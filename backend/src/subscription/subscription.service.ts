import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.subscription.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.subscription.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Subscription not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your subscription');
    return item;
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id, userId);
    return this.prisma.subscription.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.subscription.delete({ where: { id } });
  }
}