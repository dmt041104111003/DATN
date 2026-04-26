import {
  Controller,
  Post,
  Patch,
  Put,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

export interface CreateProfileDto {
  roleCode: string;
  displayName: string;
  phoneNumber?: string;
  provinceId: string;
  districtId: string;
  wardId: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  phoneNumber?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async listProfilesForAdmin(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const rows = await this.profileService.listProfiles(walletAddress);
    const total = rows.length;
    const end = Math.max(total - 1, 0);
    res.setHeader('Content-Range', `profile 0-${end}/${total}`);
    return rows;
  }

  @Get('public/:walletAddress')
  async getPublicProfile(@Req() req: any) {
    const walletAddress = (req?.params?.walletAddress || '').trim();
    if (!walletAddress) {
      throw new HttpException(
        'Public profile lookup requires an account reference.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.profileService.getPublicProfile(walletAddress);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  async getRoles() {
    return this.profileService.getRoles();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() body: CreateProfileDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const created = await this.profileService.createProfile(userId, body);
      if (created?.token && typeof created.token === 'string') {
        this.setAuthCookie(res, created.token);
      }
      return created?.profile ?? created;
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProfileById(@Req() req: any, @Param('id') _id: string) {
    const profileId = req.user?.profileId;
    if (!profileId) {
      throw new HttpException('Profile not found for this user', HttpStatus.BAD_REQUEST);
    }
    return this.profileService.getProfileById(profileId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async replaceProfile(@Body() body: UpdateProfileDto, @Req() req: any, @Param('id') _id: string) {
    const profileId = req.user?.profileId;
    if (!profileId) {
      throw new HttpException('Profile not found for this user', HttpStatus.BAD_REQUEST);
    }
    return this.profileService.updateProfile(profileId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async patchProfile(@Body() body: UpdateProfileDto, @Req() req: any, @Param('id') _id: string) {
    const profileId = req.user?.profileId;
    if (!profileId) {
      throw new HttpException('Profile not found for this user', HttpStatus.BAD_REQUEST);
    }
    return this.profileService.updateProfile(profileId, body);
  }

}
