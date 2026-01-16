import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.certification.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.certification.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Certification not found');
    return item;
  }

  async create(dto: CreateCertificationDto) {
    return this.prisma.certification.create({ data: dto });
  }

  async update(id: string, dto: UpdateCertificationDto) {
    await this.findOne(id);
    return this.prisma.certification.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.certification.delete({ where: { id } });
  }
}