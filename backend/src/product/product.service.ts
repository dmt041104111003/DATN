import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

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

  private async getActiveSubscription(userId: string) {
    const now = new Date();
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async checkProductLimit(userId: string) {
    const subscription = await this.getActiveSubscription(userId);
    const maxProducts = subscription?.service.maxProducts ?? 5;
    if (maxProducts === null) return;
    const currentCount = await this.prisma.product.count({ where: { userId } });
    if (currentCount >= maxProducts) {
      const tierName = subscription?.service.name ?? 'Free';
      throw new ForbiddenException(
        `Bạn đã đạt giới hạn ${maxProducts} sản phẩm của gói ${tierName}. Nâng cấp gói để tạo thêm.`
      );
    }
  }

  async create(userId: string, dto: CreateProductDto) {
    await this.checkProductLimit(userId);
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

  async getQuota(userId: string) {
    const subscription = await this.getActiveSubscription(userId);
    const maxProducts = subscription?.service.maxProducts ?? 5;
    const currentCount = await this.prisma.product.count({ where: { userId } });
    
    return {
      tier: subscription?.service.name ?? 'Free',
      maxProducts: maxProducts,
      usedProducts: currentCount,
      remainingProducts: maxProducts === null ? 'unlimited' : maxProducts - currentCount,
    };
  }

  async traceByNft(policyId: string, assetName: string) {
    const assetNameHex = this.toHex(assetName);
    const product = await this.prisma.product.findFirst({
      where: { policyId, assetName },
      include: {
        documents: true,
        productionProcesses: true,
        certifications: true,
        warehouseStorages: {
          include: { warehouse: true },
        },
        productMaterials: {
          include: {
            material: {
              include: {
                supplier: true,
              },
            },
          },
        },
        user: {
          select: { id: true, address: true },
        },
      },
    });

    let assetInfo: any = null;
    let onChainMetadata: any = null;

    try {
      [assetInfo, onChainMetadata] = await Promise.all([
        this.blockchain.getAssetInfo(policyId, assetNameHex),
        this.blockchain.getAssetMetadata(policyId, assetNameHex),
      ]);
    } catch (error) {
    }

    if (!product && !assetInfo) {
      throw new NotFoundException('Product not found');
    }

    return {
      product: product ? {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        documents: product.documents,
        productionProcesses: product.productionProcesses,
        certifications: product.certifications,
        warehouseStorages: product.warehouseStorages,
        materials: product.productMaterials.map((pm) => ({
          name: pm.material.name,
          quantity: pm.quantity,
          unit: pm.unit,
          harvestDate: pm.material.harvestDate,
          supplier: {
            name: pm.material.supplier.name,
            location: pm.material.supplier.location,
          },
        })),
        owner: product.user.address,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      } : null,
      blockchain: {
        policyId,
        assetName,
        assetInfo,
        onChainMetadata,
      },
    };
  }

  async getHistory(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.policyId || !product.assetName) {
      return {
        product: { id: product.id, name: product.name },
        history: [],
        message: 'Product has not been minted as NFT yet',
      };
    }

    const assetNameHex = this.toHex(product.assetName);
    const history = await this.blockchain.getAssetHistory(
      product.policyId,
      assetNameHex,
    );

    return {
      product: {
        id: product.id,
        name: product.name,
        policyId: product.policyId,
        assetName: product.assetName,
      },
      history,
    };
  }

  private toHex(str: string): string {
    if (/^[0-9a-fA-F]+$/.test(str)) {
      return str;
    }
    return Buffer.from(str, 'utf8').toString('hex');
  }
}
