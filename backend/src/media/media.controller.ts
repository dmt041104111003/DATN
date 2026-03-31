import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import axios from 'axios';
import FormData = require('form-data');
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

/**
 * One-off uploads for lot passports (no library / catalog table).
 */
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body() body: { name?: string; mimeType?: string },
  ) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
    const PINATA_GATEWAY =
      process.env.PINATA_GATEWAY || process.env.NEXT_PUBLIC_PINATA_GATEWAY;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new HttpException(
        'File storage credentials are not configured on the server.',
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

    const data = res.data as { IpfsHash?: string; error?: unknown; message?: string };
    if (!data?.IpfsHash) {
      throw new HttpException(
        data?.message || 'Failed to store file.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ipfsHash = data.IpfsHash;
    const url = PINATA_GATEWAY
      ? `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`
      : `https://ipfs.io/ipfs/${ipfsHash}`;

    const name = (body.name || file.originalname || 'Lot image').trim();
    const mimeType = (body.mimeType || file.mimetype || 'image/*').trim();

    const custodian =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub || null;

    const media = await (this.prisma as any).media.upsert({
      where: { ipfsUri: `ipfs://${ipfsHash}` },
      create: {
        ipfsUri: `ipfs://${ipfsHash}`,
        ipfsHash,
        url,
        name,
        mimeType,
        sizeBytes: typeof file?.size === 'number' ? file.size : null,
        createdByAddress: custodian ? String(custodian).trim() || null : null,
      } as any,
      update: {
        url,
        name,
        mimeType,
      } as any,
    });

    return {
      mediaId: String(media?.id || ''),
      ipfsHash,
      url,
      ipfsUri: `ipfs://${ipfsHash}`,
      mimeType,
      name,
    };
  }
}
