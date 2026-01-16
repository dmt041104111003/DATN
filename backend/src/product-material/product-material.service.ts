import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';

@Injectable()
export class ProductMaterialService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string, userId: string) {
    await this.checkProductOwnership(productId, userId);
    return this.prisma.productMaterial.findMany({
      where: { productId },
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const pm = await this.prisma.productMaterial.findUnique({
      where: { id },
      include: {
        product: true,
        material: {
          include: { supplier: true },
        },
      },
    });
    if (!pm) throw new NotFoundException('ProductMaterial not found');
    if (pm.product.userId !== userId) throw new ForbiddenException('Not your product');
    return pm;
  }

  async create(userId: string, dto: CreateProductMaterialDto) {
    await this.checkProductOwnership(dto.productId, userId);
    await this.checkMaterialOwnership(dto.materialId, userId);

    return this.prisma.productMaterial.create({
      data: dto,
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProductMaterialDto) {
    const pm = await this.findOneOwned(id, userId);
    return this.prisma.productMaterial.update({
      where: { id },
      data: dto,
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.productMaterial.delete({ where: { id } });
  }

  private async findOneOwned(id: string, userId: string) {
    const pm = await this.prisma.productMaterial.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!pm) throw new NotFoundException('ProductMaterial not found');
    if (pm.product.userId !== userId) throw new ForbiddenException('Not your product');
    return pm;
  }

  private async checkProductOwnership(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException('Not your product');
  }

  private async checkMaterialOwnership(materialId: string, userId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { supplier: true },
    });
    if (!material) throw new NotFoundException('Material not found');
    if (material.supplier.userId !== userId) throw new ForbiddenException('Not your material');
  }
}
