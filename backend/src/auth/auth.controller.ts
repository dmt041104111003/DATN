import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, StakeAddressInput } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

type StakeAddressDtoInput = StakeAddressInput | string | null | undefined;

export interface CreateNonceDto {
  stakeAddress: StakeAddressDtoInput;
}

export interface VerifySignatureDto {
  stakeAddress: StakeAddressDtoInput;
  nonce: string;
  signature: string;
  key: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    const sameSite =
      (process.env.COOKIE_SAMESITE as any) || ('lax' as 'lax' | 'strict' | 'none');
    const secure =
      (process.env.COOKIE_SECURE || '').toLowerCase() === 'true'
        ? true
        : process.env.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookie(res: Response) {
    const sameSite =
      (process.env.COOKIE_SAMESITE as any) || ('lax' as 'lax' | 'strict' | 'none');
    const secure =
      (process.env.COOKIE_SECURE || '').toLowerCase() === 'true'
        ? true
        : process.env.NODE_ENV === 'production';
    res.cookie('auth_token', '', {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 0,
    });
  }

  @Post('nonce')
  async createNonce(@Body() body: CreateNonceDto) {
    try {
      const addr = this.normalizeAddress(body.stakeAddress);
      
      if (!addr) {
        throw new HttpException('Missing stakeAddress', HttpStatus.BAD_REQUEST);
      }

      const nonce = await this.authService.generateNonce(addr);
      return { nonce };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  async verifySignature(
    @Body() body: VerifySignatureDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const addr = this.normalizeAddress(body.stakeAddress);
      
      if (!addr || !body.nonce || !body.signature || !body.key) {
        throw new HttpException('Missing authentication parameters', HttpStatus.BAD_REQUEST);
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const account =
      req.user && req.user.sub
        ? await (this.authService as any)['prisma'].custodianAccount.findUnique({
            where: { address: String(req.user.sub || '').trim() },
          })
        : null;

    return {
      user: req.user,
      profile: account && account.roleCode ? {
        id: account.id,
        walletAddress: account.address,
        roleCode: account.roleCode,
        displayName: account.displayName,
        location: account.location,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      } : null,
    };
  }

  // Helper function to normalize address input
  private normalizeAddress(input: StakeAddressDtoInput): string | null {
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
