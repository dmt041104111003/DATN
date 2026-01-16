import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.service.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Service not found');
    return item;
  }
}
