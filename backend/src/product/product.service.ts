import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Lấy tất cả users
  async findAll() {
    return this.prisma.product.findMany();
  }

  // Lấy 1 user theo ID
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Tạo user mới
  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  // Cập nhật user
  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);  // Kiểm tra tồn tại
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  // Xóa user
  async remove(id: string) {
    await this.findOne(id);  // Kiểm tra tồn tại
    return this.prisma.product.delete({ where: { id } });
  }
}