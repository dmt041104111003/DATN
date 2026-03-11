import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssetImageService } from './asset-image.service';
import axios from 'axios';
import FormData = require('form-data');

@Controller('asset-images')
@UseGuards(JwtAuthGuard)
export class AssetImageController {
  constructor(private readonly assetImageService: AssetImageService) {}

  private getWalletAddress(req: any): string {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return walletAddress;
  }

  @Get()
  async list(@Req() req: any) {
    return this.assetImageService.listForOwner(this.getWalletAddress(req));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      name: string;
      mimeType: string;
      ipfsHash: string;
      url: string;
    },
  ) {
    return this.assetImageService.createForOwner({
      ownerWalletAddress: this.getWalletAddress(req),
      name: body.name,
      mimeType: body.mimeType,
      ipfsHash: body.ipfsHash,
      url: body.url,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body()
    body: {
      name?: string;
      mimeType?: string;
    },
  ) {
    const ownerWalletAddress = this.getWalletAddress(req);
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
    const PINATA_GATEWAY =
      process.env.PINATA_GATEWAY || process.env.NEXT_PUBLIC_PINATA_GATEWAY;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new HttpException(
        'Pinata API credentials are not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          ...(form as any).getHeaders(),
        },
        maxBodyLength: Infinity,
      },
    );

    const data = res.data as any;
    if (!data?.IpfsHash) {
      throw new HttpException(
        data?.error || data?.message || 'Failed to upload to Pinata',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ipfsHash: string = data.IpfsHash;
    const url = PINATA_GATEWAY
      ? `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`
      : `https://ipfs.io/ipfs/${ipfsHash}`;

    const image = await this.assetImageService.createForOwner({
      ownerWalletAddress,
      name: (body.name || file.originalname || 'Asset image').trim(),
      mimeType: (body.mimeType || file.mimetype || 'image/*').trim(),
      ipfsHash,
      url,
    });

    return image;
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; mimeType?: string },
  ) {
    return this.assetImageService.updateForOwner({
      id,
      ownerWalletAddress: this.getWalletAddress(req),
      name: body.name,
      mimeType: body.mimeType,
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.assetImageService.removeForOwner(
      id,
      this.getWalletAddress(req),
    );
  }
}

