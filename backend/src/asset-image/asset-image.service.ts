import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetImageService {
  constructor(private readonly prisma: PrismaService) {}

  async listForOwner(ownerWalletAddress: string) {
    const addr = (ownerWalletAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Owner wallet address is required');
    }

    const images = await (this.prisma as any).assetImage.findMany({
      where: { ownerWalletAddress: addr },
      orderBy: { createdAt: 'desc' },
    });

    return images;
  }

  async createForOwner(params: {
    ownerWalletAddress: string;
    name: string;
    mimeType: string;
    ipfsHash: string;
    url: string;
  }) {
    const ownerWalletAddress = (params.ownerWalletAddress || '').trim();
    const name = (params.name || '').trim();
    const mimeType = (params.mimeType || '').trim();
    const ipfsHash = (params.ipfsHash || '').trim();
    const url = (params.url || '').trim();

    if (!ownerWalletAddress) {
      throw new BadRequestException('Owner wallet address is required');
    }
    if (!name || !mimeType || !ipfsHash || !url) {
      throw new BadRequestException('name, mimeType, ipfsHash and url are required');
    }

    return (this.prisma as any).assetImage.create({
      data: {
        ownerWalletAddress,
        name,
        mimeType,
        ipfsHash,
        url,
      },
    });
  }

  async updateForOwner(params: {
    id: string;
    ownerWalletAddress: string;
    name?: string;
    mimeType?: string;
  }) {
    const id = (params.id || '').trim();
    const ownerWalletAddress = (params.ownerWalletAddress || '').trim();
    if (!id || !ownerWalletAddress) {
      throw new BadRequestException('id and ownerWalletAddress are required');
    }

    const existing = await (this.prisma as any).assetImage.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== ownerWalletAddress) {
      throw new NotFoundException('Image not found');
    }

    const data: any = {};
    if (typeof params.name === 'string') data.name = params.name.trim();
    if (typeof params.mimeType === 'string') data.mimeType = params.mimeType.trim();

    return (this.prisma as any).assetImage.update({
      where: { id },
      data,
    });
  }

  async removeForOwner(id: string, ownerWalletAddress: string) {
    id = (id || '').trim();
    ownerWalletAddress = (ownerWalletAddress || '').trim();
    if (!id || !ownerWalletAddress) {
      throw new BadRequestException('id and ownerWalletAddress are required');
    }

    const existing = await (this.prisma as any).assetImage.findUnique({
      where: { id },
    });
    if (!existing || existing.ownerWalletAddress !== ownerWalletAddress) {
      throw new NotFoundException('Image not found');
    }

    await (this.prisma as any).assetImage.delete({ where: { id } });
    return { success: true };
  }
}

