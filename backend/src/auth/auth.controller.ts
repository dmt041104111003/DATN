import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from './dto/verify-wallet.dto';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

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

  @Get('me')
  getMe(@CurrentUser() user: { id: string; address: string }) {
    return { user };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }
}
