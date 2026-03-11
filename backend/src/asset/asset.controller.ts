import { Controller, Post, Body, HttpException, HttpStatus, Get, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export interface CreateAssetDto {
  policyId: string;
  assetName: string;
  unit: string;
  txHash: string;
  owners: string[];
  warehouseId?: string | null;
  metadata: {
    name: string;
    description: string;
    brand?: string;
    model?: string;
    material?: string;
    battery?: string;
    image?: string;
    mediaType?: string;
    roadmap?: string;
    location?: string;
  };
}

export interface UpdateAssetDto {
  txHash: string;
  owners?: string[];
  metadata?: {
    name?: string;
    description?: string;
    brand?: string;
    model?: string;
    material?: string;
    battery?: string;
    image?: string;
    mediaType?: string;
    roadmap?: string;
    location?: string;
  };
}

export interface UpdateAssetLocationDto {
  location?: string;
  txHash?: string;
}

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: CreateAssetDto) {
    try {
      const walletAddress =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!walletAddress) {
        throw new HttpException(
          'Unable to determine wallet address from token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.assetService.create({
        ...body,
        ownerWalletAddress: walletAddress,
      });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create asset',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    try {
      const walletAddress =
        req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

      if (!walletAddress) {
        throw new HttpException(
          'Unable to determine wallet address from token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.assetService.findAll(walletAddress);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to fetch assets',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':unit')
  async updateByUnit(@Param('unit') unit: string, @Body() body: UpdateAssetDto) {
    try {
      return await this.assetService.updateByUnit(unit, body);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to update asset',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':unit/location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(@Req() req: any, @Param('unit') unit: string, @Body() body: UpdateAssetLocationDto) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const location = (body?.location || '').trim();
    const txHash = (body?.txHash || '').trim();
    if (!location || !txHash) {
      throw new HttpException('location and txHash are required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.assetService.updateLocationByUnit({
      unit,
      walletAddress,
      location,
      txHash,
    });
    if (!result?.success) {
      throw new HttpException(result?.message || 'Not allowed', HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Delete(':unit')
  async deleteByUnit(@Param('unit') unit: string) {
    try {
      await this.assetService.deleteByUnit(unit);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to delete asset',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

