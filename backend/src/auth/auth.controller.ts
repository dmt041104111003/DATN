import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from './dto/verify-wallet.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('nonce')
  getNonce(@Query() dto: GetNonceDto) {
    return this.authService.getNonce(dto.address);
  }

  @Public()
  @Post('verify')
  async verifyWallet(
    @Body() dto: VerifyWalletDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyWallet(
      dto.address,
      dto.signature,
      dto.key,
    );

    // Set cookie HTTP-only
    res.cookie('access_token', result.access_token, {
      httpOnly: true, // JS không đọc được
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Trả về user info (không trả token)
    return {
      user: result.user,
    };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }
}
