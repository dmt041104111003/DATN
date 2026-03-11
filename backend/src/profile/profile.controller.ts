import { Controller, Post, Patch, Body, HttpException, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

export interface CreateProfileDto {
  roleCode: string;
  displayName: string;
  location?: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  location?: string;
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async listProfiles(@Req() req: any) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;

    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.profileService.listProfiles(walletAddress);
  }

  @Get('public/:walletAddress')
  async getPublicProfile(@Req() req: any) {
    const walletAddress = (req?.params?.walletAddress || '').trim();
    if (!walletAddress) {
      throw new HttpException('walletAddress is required', HttpStatus.BAD_REQUEST);
    }
    return this.profileService.getPublicProfile(walletAddress);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(@Body() body: CreateProfileDto, @Req() req: any) {
    try {
      const userId = req.user.sub;
      return this.profileService.createProfile(userId, body);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: any) {
    try {
      const profileId = req.user.profileId;
      if (!profileId) {
        throw new HttpException('Profile not found for this user', HttpStatus.BAD_REQUEST);
      }
      return this.profileService.updateProfile(profileId, body);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
