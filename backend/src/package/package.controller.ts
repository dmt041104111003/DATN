import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PackageService } from './package.service';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException(
        'Unable to determine account identity from session.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return custodian;
  }

  @Get()
  async list(@Req() req: any) {
    return this.packageService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.packageService.createBulk(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to create package(s).',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

