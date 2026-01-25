import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { SUBSCRIPTION_STATUS } from './subscription.constants';

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringSubscriptions() {
    this.logger.log('Checking expiring subscriptions...');

    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      include: {
        user: true,
        service: true,
      },
    });

    for (const subscription of activeSubscriptions) {
      const daysUntilExpiry = Math.ceil(
        (new Date(subscription.endDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry === 7) {
        await this.sendNotification(
          subscription,
          'Your subscription will expire in 7 days',
        );
      } else if (daysUntilExpiry === 3) {
        await this.sendNotification(
          subscription,
          'Your subscription will expire in 3 days',
        );
      } else if (daysUntilExpiry === 1) {
        await this.sendNotification(
          subscription,
          'Your subscription will expire in 1 day',
        );
      }
    }

    this.logger.log(`Checked ${activeSubscriptions.length} subscriptions`);
  }

  private async sendNotification(
    subscription: any,
    message: string,
  ): Promise<void> {
    this.logger.log(
      `Sending notification to user ${subscription.userId}: ${message}`,
    );

    const notificationMessage = `${message}. Plan: ${subscription.service?.name || 'Unknown'}, Expires: ${new Date(subscription.endDate).toLocaleDateString()}`;

    console.log(`[NOTIFICATION] User: ${subscription.user.address}`);
    console.log(`[NOTIFICATION] Message: ${notificationMessage}`);

    // TODO: Implement actual notification system (email, push notification, etc.)
    // For now, we just log it. You can integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - Push notification service
    // - In-app notification system
  }
}
