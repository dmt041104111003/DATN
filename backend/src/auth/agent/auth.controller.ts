import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AgentAuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from '../dto/verify-wallet.dto';
import { Public } from '../decorators';

@Controller('agent/auth')
export class AuthController {
  constructor(private authService: AgentAuthService) {}

  @Public()
  @Get('nonce')
  getAgentNonce(@Query() dto: GetNonceDto) {
    return this.authService.getNonce(dto.address);
  }

  @Public()
  @Post('verify')
  async verifyAgentWallet(
    @Body() dto: VerifyWalletDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyWallet(
      dto.address,
      dto.signature,
      dto.key,
      dto.walletName,
    );

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
    };
  }
}

