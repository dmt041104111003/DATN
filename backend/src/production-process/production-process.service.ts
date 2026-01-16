import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductionProcessDto } from './dto/create-production-process.dto';
import { UpdateProductionProcessDto } from './dto/update-production-process.dto';

@Injectable()
export class ProductionProcessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productionProcess.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.productionProcess.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('ProductionProcess not found');
    return item;
  }

  async create(dto: CreateProductionProcessDto) {
    return this.prisma.productionProcess.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductionProcessDto) {
    await this.findOne(id);
    return this.prisma.productionProcess.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productionProcess.delete({ where: { id } });
  }
}