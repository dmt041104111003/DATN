import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService, StakeAddressInput } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export interface CreateNonceDto {
  stakeAddress: StakeAddressInput;
}

export interface VerifySignatureDto {
  stakeAddress: StakeAddressInput;
  nonce: string;
  signature: string;
  key: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  async createNonce(@Body() body: CreateNonceDto) {
    try {
      const addr = this.normalizeAddress(body.stakeAddress as StakeAddressInput);
      
      if (!addr) {
        throw new HttpException('Missing stakeAddress', HttpStatus.BAD_REQUEST);
      }

      const nonce = this.authService.generateNonce(addr);
      return { nonce };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify')
  async verifySignature(@Body() body: VerifySignatureDto) {
    try {
      const addr = this.normalizeAddress(body.stakeAddress as StakeAddressInput);
      
      if (!addr || !body.nonce || !body.signature || !body.key) {
        throw new HttpException('Missing authentication parameters', HttpStatus.BAD_REQUEST);
      }

      return this.authService.verifyAndIssueToken({
        stakeAddress: addr,
        nonce: body.nonce,
        signature: body.signature,
        key: body.key,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const profile = req.user && req.user.profileId
      ? await this.authService['prisma'].profile.findUnique({
          where: { id: req.user.profileId },
        })
      : null;

    return {
      user: req.user,
      profile: profile && {
        id: profile.id,
        walletAddress: profile.walletAddress,
        roleCode: profile.roleCode,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    };
  }

  // Helper function to normalize address input
  private normalizeAddress(input: StakeAddressInput): string | null {
    if (typeof input === 'string') {
      return input;
    }
    if (input && typeof input === 'object' && input.address) {
      return input.address;
    }
    return null;
  }
}
