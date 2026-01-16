import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.payment.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.payment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Payment not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your payment');
    return item;
  }

  async create(userId: string, dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: { ...dto, userId },
    });
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