import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { service: true },
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.subscription.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!item) throw new NotFoundException('Subscription not found');
    if (item.userId !== userId)
      throw new ForbiddenException('Not your subscription');
    return item;
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    const now = new Date();
    const data = {
      userId,
      servicePlanId: dto.servicePlanId,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      endDate: dto.endDate ? new Date(dto.endDate) : now, // Will be updated when payment verified
      status: dto.status || 'pending',
    };

    return this.prisma.subscription.create({
      data,
      include: { service: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id, userId);
    return this.prisma.subscription.update({
      where: { id },
      data: dto,
      include: { service: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    const paymentCount = await this.prisma.payment.count({
      where: { subscriptionId: id },
    });

    if (paymentCount > 0) {
      return this.prisma.subscription.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { service: true },
      });
    }

    return this.prisma.subscription.delete({ where: { id } });
  }
  async cancel(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'cancelled' },
      include: { service: true },
    });
  }
}
