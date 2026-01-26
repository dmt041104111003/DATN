import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetNonceDto, VerifyWalletDto } from './dto/verify-wallet.dto';
import { Public, CurrentUser } from './decorators';

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

  @Get('me')
  async getMe(@CurrentUser() user: { id: string; address: string }) {
    const userData = await this.authService.validateUser(user.id);
    if (!userData || typeof userData === 'string') {
      throw new UnauthorizedException('User not found');
    }
    return {
      user: {
        id: userData.id,
        address: userData.address,
        walletName: userData.walletName,
        role: userData.role,
      },
    };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }
}
