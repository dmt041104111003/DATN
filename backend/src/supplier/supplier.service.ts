import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  // Lấy tất cả users
  async findAll() {
    return this.prisma.supplier.findMany();
  }

  // Lấy 1 user theo ID
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  // Tạo user mới
  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  // Cập nhật user
  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);  // Kiểm tra tồn tại
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  // Xóa user
  async remove(id: string) {
    await this.findOne(id);  // Kiểm tra tồn tại
    return this.prisma.supplier.delete({ where: { id } });
  }
}