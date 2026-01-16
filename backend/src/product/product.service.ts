import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findAllByUser(userId: string) {
    return this.prisma.product.findMany({ where: { userId } });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async findOneOwned(id: string, userId: string) {
    const product = await this.findOne(id);
    if (product.userId !== userId) throw new ForbiddenException('Not your product');
    return product;
  }

  async create(userId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateProductDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.product.delete({ where: { id } });
  }
}