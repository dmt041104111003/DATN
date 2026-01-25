import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SUBSCRIPTION_STATUS } from './subscription.constants';
import { PayDto } from './dto/pay.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async findAllByUser(userId: string) {
    await this.updateExpiredSubscriptions(userId);

    return this.prisma.subscription.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateExpiredSubscriptions(userId?: string) {
    const now = new Date();
    const where = userId
      ? {
          userId,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          endDate: { lt: now },
        }
      : {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          endDate: { lt: now },
        };

    return this.prisma.subscription.updateMany({
      where,
      data: { status: SUBSCRIPTION_STATUS.EXPIRED },
    });
  }

  async getActiveSubscription(userId: string) {
    await this.updateExpiredSubscriptions(userId);
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    if (subscription.userId !== userId) {
      throw new ForbiddenException('Not your subscription');
    }
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SUBSCRIPTION_STATUS.CANCELLED },
      include: { service: true },
    });
  }

  async pay(userId: string, dto: PayDto) {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { txHash: dto.txHash },
    });
    if (existingSubscription) {
      throw new BadRequestException('Transaction hash already used');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.servicePlanId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.updateExpiredSubscriptions(userId);

    const activeSubscription = await this.getActiveSubscription(userId);
    if (activeSubscription) {
      await this.prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: SUBSCRIPTION_STATUS.CANCELLED },
      });
    }

    const verification = await this.blockchain.verifyPayment(
      dto.txHash,
      service.price,
    );

    if (!verification.valid) {
      throw new BadRequestException(verification.message);
    }
    if (!verification.confirmedAmount) {
      throw new BadRequestException(
        'Could not confirm payment amount from blockchain',
      );
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + service.duration);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        servicePlanId: dto.servicePlanId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startDate: now,
        endDate: endDate,
        amount: verification.confirmedAmount,
        currency: 'ADA',
        txHash: dto.txHash,
        paymentDate: now,
      },
      include: { service: true },
    });

    return {
      result: true,
      message: 'Payment successful and subscription activated',
      data: { subscription },
    };
  }
}
