import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.payment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Payment not found');
    return item;
  }

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({ data: dto });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);
    return this.prisma.payment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.payment.delete({ where: { id } });
  }
}