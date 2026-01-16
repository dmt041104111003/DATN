import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.certification.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('Certification not found');
    if (item.product.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }

  async create(userId: string, dto: CreateCertificationDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException('Not your product');
    
    return this.prisma.certification.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateCertificationDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.certification.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.certification.delete({ where: { id } });
  }
}