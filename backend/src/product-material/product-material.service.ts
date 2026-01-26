import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateProductMaterialDto } from './dto/create-product-material.dto';
import { UpdateProductMaterialDto } from './dto/update-product-material.dto';
import { hashProductMaterial } from '../utils/hash.util';

@Injectable()
export class ProductMaterialService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private subscriptionService: SubscriptionService,
  ) {}

  private async checkSubscriptionActive(userId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(userId);
    if (!subscription) {
      throw new BadRequestException(
        'Subscription has expired. Please renew to continue using this feature.',
      );
    }
    return subscription;
  }

  async findByProduct(productId: string, userId: string) {
    await this.checkProductOwnership(productId, userId);

    const cacheKey = `product-materials:product:${productId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const materials = await this.prisma.productMaterial.findMany({
      where: { productId },
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
    await this.redis.set(cacheKey, materials, 300);
    return materials;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `product-material:${id}`;
    const cached = await this.redis.get<{ id: string; productId: string; materialId: string; quantity: number; unit: string | null; createdAt: Date; updatedAt: Date; product: { id: string; userId: string; name: string; policyId: string; assetName: string; createdAt: Date; updatedAt: Date }; material: { id: string; userId: string; supplierId: string; name: string; harvestDate: Date | null; createdAt: Date; updatedAt: Date; supplier: { id: string; userId: string; name: string; location: string | null; gpsCoordinates: string | null; contactInfo: string | null; createdAt: Date; updatedAt: Date } } }>(cacheKey);
    if (cached && typeof cached === 'object' && 'product' in cached) {
      if (cached.product.userId !== userId)
        throw new ForbiddenException('Not your product');
      return cached;
    }

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
    if (pm.product.userId !== userId)
      throw new ForbiddenException('Not your product');

    await this.redis.set(cacheKey, pm, 300);
    return pm;
  }

  async create(userId: string, dto: CreateProductMaterialDto) {
    await this.checkSubscriptionActive(userId);
    
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    
    await this.checkProductOwnership(dto.productId, userId);
    await this.checkMaterialOwnership(dto.materialId, userId);

    const existing = await this.prisma.productMaterial.findUnique({
      where: {
        productId_materialId: {
          productId: dto.productId,
          materialId: dto.materialId,
        },
      },
    });
    
    if (existing) {
      throw new BadRequestException('This material has already been added to the product. Please update the quantity instead of adding a new entry.');
    }

    const pmHash = hashProductMaterial(dto.materialId, dto.quantity, dto.unit);
    const pm = await (this.prisma as any).productMaterial.create({
      data: {
        ...dto,
        pmHash,
      },
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
    await this.redis.del(`product-materials:product:${dto.productId}`);
    return pm;
  }

  async update(id: string, userId: string, dto: UpdateProductMaterialDto) {
    await this.checkSubscriptionActive(userId);
    
    if (dto.quantity !== undefined && dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    
    const pm = await this.findOneOwned(id, userId);
    const quantity = dto.quantity !== undefined ? dto.quantity : pm.quantity;
    const unit = dto.unit !== undefined ? dto.unit : pm.unit;
    const pmHash = hashProductMaterial(pm.materialId, quantity, unit);
    
    const updated = await (this.prisma as any).productMaterial.update({
      where: { id },
      data: {
        ...dto,
        pmHash,
      },
      include: {
        material: {
          include: { supplier: true },
        },
      },
    });
    await this.redis.delMultiple([
      `product-material:${id}`,
      `product-materials:product:${pm.productId}`,
    ]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const pm = await this.findOneOwned(id, userId);
    await this.prisma.productMaterial.delete({ where: { id } });
    await this.redis.delMultiple([
      `product-material:${id}`,
      `product-materials:product:${pm.productId}`,
    ]);
  }

  private async findOneOwned(id: string, userId: string) {
    const pm = await this.prisma.productMaterial.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!pm) throw new NotFoundException('ProductMaterial not found');
    if (pm.product.userId !== userId)
      throw new ForbiddenException('Not your product');
    return pm;
  }

  private async checkProductOwnership(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');
  }

  private async checkMaterialOwnership(materialId: string, userId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { supplier: true },
    });
    if (!material) throw new NotFoundException('Material not found');
    if (material.supplier.userId !== userId)
      throw new ForbiddenException('Not your material');
  }
}
