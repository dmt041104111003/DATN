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

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  private getWalletAddress(req: any) {
    const user = req?.user || {};
    const walletAddress = user.walletAddress || user.paymentAddress || user.sub;

    if (!walletAddress) {
      throw new HttpException(
        'Không xác định được địa chỉ ví từ token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return walletAddress;
  }

  private getProfileId(req: any) {
    const profileId = req?.user?.profileId;

    if (!profileId) {
      throw new HttpException('Không tìm thấy hồ sơ cho người dùng này', HttpStatus.BAD_REQUEST);
    }

    return profileId;
  }

  private rethrow(error: unknown): never {
    if (error instanceof HttpException) throw error;
    throw new HttpException('Lỗi máy chủ nội bộ', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private setAuthCookie(res: Response, token: string) {
    const envSameSite = String(process.env.COOKIE_SAMESITE || '').trim().toLowerCase();
    const sameSite = (envSameSite || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as
      | 'lax'
      | 'strict'
      | 'none';
    const envSecure = (process.env.COOKIE_SECURE || '').toLowerCase();
    const secure = envSecure ? envSecure === 'true' : process.env.NODE_ENV === 'production' || sameSite === 'none';
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
    return this.profileService.listProfiles(this.getWalletAddress(req));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listProfilesForAdmin(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const rows = await this.profileService.listProfiles(this.getWalletAddress(req));
    const total = rows.length;
    const end = Math.max(total - 1, 0);
    res.setHeader('Content-Range', `profile 0-${end}/${total}`);
    return rows;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() body: any,
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
      this.rethrow(error);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Body() body: any, @Req() req: any) {
    try {
      return this.profileService.updateProfile(this.getProfileId(req), body);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProfileById(@Req() req: any, @Param('id') _id: string) {
    return this.profileService.getProfileById(this.getProfileId(req));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async replaceProfile(@Body() body: any, @Req() req: any, @Param('id') _id: string) {
    return this.profileService.updateProfile(this.getProfileId(req), body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async patchProfile(@Body() body: any, @Req() req: any, @Param('id') _id: string) {
    return this.profileService.updateProfile(this.getProfileId(req), body);
  }

}
