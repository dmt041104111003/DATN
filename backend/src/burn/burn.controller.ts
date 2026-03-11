import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BurnService, BurnCheckResult } from './burn.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('burn')
@UseGuards(JwtAuthGuard)
export class BurnController {
  constructor(private readonly burnService: BurnService) {}

  @Post('check')
  async check(
    @Req() req: any,
    @Body() body: { assetName?: string },
  ): Promise<BurnCheckResult> {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.burnService.checkBurn(walletAddress, body?.assetName ?? '');
  }

  @Post('create')
  async create(
    @Req() req: any,
    @Body()
    body: {
      policyId?: string;
      assetName?: string;
      unit?: string;
      txHash?: string;
    },
  ) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const policyId = (body?.policyId || '').trim();
    const assetName = (body?.assetName || '').trim();
    const unit = (body?.unit || '').trim();
    const txHash = (body?.txHash || '').trim();

    if (!policyId || !assetName || !unit || !txHash) {
      throw new HttpException('Missing fields', HttpStatus.BAD_REQUEST);
    }

    return this.burnService.recordBurn({
      walletAddress,
      policyId,
      assetName,
      unit,
      txHash,
    });
  }

  @Post('list')
  async list(@Req() req: any) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.burnService.listBurns(walletAddress);
  }

  @Post('owners')
  async owners(@Req() req: any, @Body() body: { unit?: string }) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const unit = (body?.unit || '').trim();
    if (!unit) {
      throw new HttpException('unit is required', HttpStatus.BAD_REQUEST);
    }

    return this.burnService.getOwnersForUnit({ walletAddress, unit });
  }
}

