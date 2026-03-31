import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GrowingAreaService } from './growing-area.service';

@Controller('growing-areas')
@UseGuards(JwtAuthGuard)
export class GrowingAreaController {
  constructor(private readonly growingAreaService: GrowingAreaService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return custodian;
  }

  @Get()
  async list(@Req() req: any) {
    return this.growingAreaService.list(this.getCustodian(req));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      traceSchemeRef: string;
      inventoryKey: string;
      txHash: string;
      custodyParties: string[];
      name: string;
      location: string;
      areaSize?: string | null;
      soilType?: string | null;
      nftImageIpfs?: string | null;
    },
  ) {
    try {
      return await this.growingAreaService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to register growing area.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':inventoryKey/verify')
  async verify(@Req() req: any, @Param('inventoryKey') inventoryKey: string) {
    try {
      throw new HttpException('Verification is handled automatically.', HttpStatus.BAD_REQUEST);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to verify growing area.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':inventoryKey')
  async remove(@Req() req: any, @Param('inventoryKey') inventoryKey: string) {
    try {
      throw new HttpException('Retire is handled automatically after confirmation.', HttpStatus.BAD_REQUEST);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to delete growing area.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

