import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SUBSCRIPTION_STATUS } from './subscription.constants';
import { PayDto } from './dto/pay.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private blockchain: BlockchainService,
  ) {}

  async findAllByUser(userId: string) {
    await this.updateExpiredSubscriptions(userId);

    const cacheKey = `subscriptions:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    await this.redis.set(cacheKey, subscriptions, 300);
    return subscriptions;
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
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: SUBSCRIPTION_STATUS.CANCELLED },
      include: { service: true },
    });
    await this.redis.delMultiple([
      `subscriptions:user:${userId}`,
      `subscription:active:${userId}`,
    ]);
    return updated;
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
    const now = new Date();

    if (activeSubscription) {
      const currentService = await this.prisma.service.findUnique({
        where: { id: activeSubscription.servicePlanId },
      });

      if (!currentService) {
        await this.prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: { status: SUBSCRIPTION_STATUS.CANCELLED },
        });
      } else if (activeSubscription.servicePlanId === dto.servicePlanId) {
        throw new BadRequestException(
          'Cannot renew. Current subscription will remain active until expiration.',
        );
      } else {
        const isUpgrade = this.isUpgrade(currentService.price, service.price);

        if (isUpgrade) {
          await this.prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: { status: SUBSCRIPTION_STATUS.CANCELLED },
          });
        } else {
          throw new BadRequestException(
            'Cannot downgrade. Current subscription will remain active until expiration.',
          );
        }
      }
    }

    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + service.duration);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        servicePlanId: dto.servicePlanId,
        status: SUBSCRIPTION_STATUS.PENDING,
        startDate: now,
        endDate: endDate,
        amount: service.price,
        currency: 'ADA',
        txHash: dto.txHash,
        paymentDate: now,
      },
      include: { service: true },
    });

    try {
      await Promise.race([
        this.verifyPaymentAsync(
          subscription.id,
          dto.txHash,
          service.price,
          service.duration,
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Verification timeout')), 15000)
        ),
      ]);
    } catch (error) {
      console.error('Payment verification timeout or error:', error);
    }

    const updatedSubscription = await this.prisma.subscription.findUnique({
      where: { id: subscription.id },
      include: { service: true },
    });

    if (updatedSubscription?.status === SUBSCRIPTION_STATUS.ACTIVE) {
      const message = activeSubscription
        ? 'Upgrade successful! Subscription activated.'
        : 'Payment verified! Subscription activated.';
      return {
        result: true,
        message,
        data: { subscription: updatedSubscription },
      };
    } else if (updatedSubscription?.status === SUBSCRIPTION_STATUS.CANCELLED) {
      return {
        result: false,
        message: 'Payment verification failed.',
        data: { subscription: updatedSubscription },
      };
    } else {
      this.verifyPaymentAsync(
        subscription.id,
        dto.txHash,
        service.price,
        service.duration,
      ).catch((err) => {
        console.error('Background verification failed:', err);
      });

      return {
        result: true,
        message: 'Transaction submitted. Verification in progress...',
        data: { subscription },
      };
    }
  }

  private isUpgrade(currentPrice: number, newPrice: number): boolean {
    return newPrice > currentPrice;
  }

  private async verifyPaymentAsync(
    subscriptionId: string,
    txHash: string,
    expectedAmount: number,
    duration: number,
  ) {
    const verification = await this.blockchain.verifyPayment(
      txHash,
      expectedAmount,
    );

    if (!verification.valid) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: SUBSCRIPTION_STATUS.CANCELLED },
      });
      return;
    }

    if (!verification.confirmedAmount) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: SUBSCRIPTION_STATUS.CANCELLED },
      });
      return;
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + duration);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        amount: verification.confirmedAmount,
        startDate: now,
        endDate: endDate,
        paymentDate: now,
      },
    });

    if (subscription) {
      await this.redis.delMultiple([
        `subscriptions:user:${subscription.userId}`,
        `subscription:active:${subscription.userId}`,
      ]);
    }
  }
}
