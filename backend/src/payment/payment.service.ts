import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async findAllByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { subscription: { include: { service: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.payment.findUnique({
      where: { id },
      include: { subscription: { include: { service: true } } },
    });
    if (!item) throw new NotFoundException('Payment not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your payment');
    return item;
  }

  async create(userId: string, dto: CreatePaymentDto) {
    const existingPayment = await this.prisma.payment.findUnique({
      where: { txHash: dto.txHash },
    });
    if (existingPayment) {
      throw new BadRequestException('Transaction hash already used');
    }
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: dto.subscriptionId },
      include: { service: true },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    if (subscription.userId !== userId) {
      throw new ForbiddenException('Not your subscription');
    }
    const expectedAmount = subscription.service.price;
    const verification = await this.blockchain.verifyPayment(
      dto.txHash,
      expectedAmount,
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
    endDate.setDate(endDate.getDate() + subscription.service.duration);

    const result = await this.prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          userId,
          subscriptionId: dto.subscriptionId,
          amount: verification.confirmedAmount!,
          currency: dto.currency || 'ADA',
          txHash: dto.txHash,
          paymentDate: now,
        },
      });

      const updatedSubscription = await prisma.subscription.update({
        where: { id: dto.subscriptionId },
        data: {
          status: 'active',
          startDate: now,
          endDate: endDate,
        },
      });

      return { payment, subscription: updatedSubscription };
    });

    return {
      result: true,
      message: 'Payment verified and subscription activated',
      data: result,
    };
  }

  async update(id: string, userId: string, dto: UpdatePaymentDto) {
    await this.findOne(id, userId);
    return this.prisma.payment.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.payment.delete({ where: { id } });
  }
}