import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private cookieConfig(maxAge: number) {
    const envSameSite = String(process.env.COOKIE_SAMESITE || '').trim().toLowerCase();
    const sameSite = (envSameSite || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as
      | 'lax'
      | 'strict'
      | 'none';
    const envSecure = (process.env.COOKIE_SECURE || '').toLowerCase();
    const secure = envSecure ? envSecure === 'true' : process.env.NODE_ENV === 'production' || sameSite === 'none';
    return { httpOnly: true, secure, sameSite, path: '/', maxAge };
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('auth_token', token, this.cookieConfig(7 * 24 * 60 * 60 * 1000));
  }

  private clearAuthCookie(res: Response) {
    res.cookie('auth_token', '', this.cookieConfig(0));
  }

  @Post('nonce')
  async createNonce(@Body() body: any) {
    const addr = this.normalizeAddress(body.stakeAddress);
    if (!addr) throw new HttpException('Thiếu stakeAddress.', HttpStatus.BAD_REQUEST);
    const nonce = await this.authService.generateNonce(addr);
    return { nonce };
  }

  @Post('verify')
  async verifySignature(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const addr = this.normalizeAddress(body.stakeAddress);
    if (!addr || !body.nonce || !body.signature || !body.key) {
      throw new HttpException('Thiếu tham số xác thực.', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.verifyAndIssueToken({
      stakeAddress: addr,
      nonce: body.nonce,
      signature: body.signature,
      key: body.key,
    });
    if (result?.token && typeof result.token === 'string') {
      this.setAuthCookie(res, result.token);
    }
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { success: true };
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  async getRoles() {
    return this.authService.getRoles();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const me = await this.authService.getMe(req?.user || null);
    const jwtRole = String(req?.user?.role || req?.user?.roleCode || '').trim();
    const dbRole = String(me?.user?.roleCode || me?.user?.role || '').trim();
    if (!jwtRole && dbRole && me?.user?.profileId) {
      const token = this.authService.buildSessionToken({
        id: String(me.user.profileId),
        address: String(me.user.walletAddress || me.user.paymentAddress || me.user.sub),
        roleCode: dbRole,
        displayName: me.user.displayName,
        phoneNumber: me.user.phoneNumber,
        isActive: me.user.isActive,
      });
      this.setAuthCookie(res, token);
    }
    return me;
  }

  private normalizeAddress(input: any): string | null {
    if (typeof input === 'string') {
      const trimmed = input.trim();
      return trimmed || null;
    }
    if (input && typeof input === 'object' && input.address) {
      const trimmed = String(input.address).trim();
      return trimmed || null;
    }
    return null;
  }
}
