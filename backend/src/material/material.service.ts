import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.material.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.material.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Material not found');
    return item;
  }

  async create(dto: CreateMaterialDto) {
    return this.prisma.material.create({ data: dto });
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id);
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.material.delete({ where: { id } });
  }
}