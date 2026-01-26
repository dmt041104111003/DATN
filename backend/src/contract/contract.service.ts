import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  BlockfrostProvider,
  deserializeAddress,
  MeshWallet,
} from '@meshsdk/core';
import { Cip68Contract } from './cip68.contract';
import { BLOCKFROST_API_KEY, appNetworkId } from './constants';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { ProductService } from '../product/product.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContractService {
  private blockfrostProvider: BlockfrostProvider;

  constructor(
    private subscriptionService: SubscriptionService,
    private productService: ProductService,
    private prisma: PrismaService,
  ) {
    this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
  }

  private async checkSubscriptionActive(userId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(userId);
    if (!subscription) {
      throw new BadRequestException(
        'Subscription has expired. Please renew to continue using this feature.',
      );
    }
    return subscription;
  }

  private async verifyProductOwnership(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.userId !== userId) {
      throw new ForbiddenException('Not your product');
    }
    return product;
  }

  async prepareProductMetadata(productId: string, userId: string) {
    await this.verifyProductOwnership(productId, userId);
    
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        certifications: true,
        productMaterials: {
          include: {
            material: {
              include: {
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const metadata: Record<string, any> = {
      name: product.name,
      productId: product.id,
      description: `Product: ${product.name}`,
    };


    if (product.productMaterials && product.productMaterials.length > 0) {
      metadata.materials = product.productMaterials.map((pm) => ({
        name: pm.material.name,
        quantity: pm.quantity,
        unit: pm.unit || '',
        harvestDate: pm.material.harvestDate?.toISOString() || '',
        supplier: {
          name: pm.material.supplier.name,
          location: pm.material.supplier.location || '',
        },
      }));
    }

    if (product.certifications && product.certifications.length > 0) {
      metadata.certifications = product.certifications.map((cert) => ({
        name: cert.certName,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString() || '',
        hash: cert.certHash || '',
      }));
    }

    return metadata;
  }

  private createWalletFromAddress(walletAddress: string): MeshWallet {
    return new MeshWallet({
      networkId: appNetworkId,
      fetcher: this.blockfrostProvider,
      submitter: this.blockfrostProvider,
      key: {
        type: 'address',
        address: walletAddress,
      },
    });
  }

  getPolicyId(walletAddress: string) {
    const wallet = this.createWalletFromAddress(walletAddress);
    const contract = new Cip68Contract({ wallet });
    return {
      policyId: contract.policyId,
      storeAddress: contract.storeAddress,
    };
  }

  async createMint(walletAddress: string, params: MintDto[], userId?: string) {
    try {
      if (userId) {
        await this.checkSubscriptionActive(userId);
      }

      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });
      const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const assets = params.map((p) => ({
        assetName: p.assetName,
        quantity: p.quantity || '1',
        receiver: p.receiver || walletAddress,
        metadata: {
          ...p.metadata,
          _pk: pubKeyHash,
        },
      }));

      const unsignedTx = await contract.mint(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createBurn(walletAddress: string, params: BurnDto[]) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });

      const assets = params.map((p) => ({
        assetName: p.assetName,
        quantity: p.quantity || '-1',
      }));

      const unsignedTx = await contract.burn(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createUpdate(walletAddress: string, params: UpdateMetadataDto[], userId?: string, productId?: string) {
    try {
      if (userId) {
        await this.checkSubscriptionActive(userId);
      }

      if (userId && productId) {
        const product = await this.verifyProductOwnership(productId, userId);
        if (!product.policyId || !product.assetName) {
          throw new BadRequestException('Product must be minted before updating metadata');
        }
        if (params.length > 0 && params[0].assetName !== product.assetName) {
          throw new BadRequestException('Asset name does not match product');
        }
      }

      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });
      const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      const assets = params.map((p) => ({
        assetName: p.assetName,
        metadata: {
          ...p.metadata,
          _pk: pubKeyHash,
        },
      }));

      const unsignedTx = await contract.update(assets);
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.message.includes('Asset') && error.message.includes('not found')) {
          throw new BadRequestException('Product does not support metadata updates. Asset not found on blockchain.');
        }
      }
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async createPayment(walletAddress: string, amount: string) {
    try {
      const wallet = this.createWalletFromAddress(walletAddress);
      const contract = new Cip68Contract({ wallet });

      const unsignedTx = await contract.payment({ amount });
      return {
        result: true,
        data: unsignedTx,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        result: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
