import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  private getRole(req: any): string {
    return String(req?.user?.role || '').trim();
  }

  @Get()
  async list(@Req() req: any) {
    return this.packageService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.packageService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to create package.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':inventoryKey')
  async update(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.packageService.updateEditable(
        this.getCustodian(req),
        this.getRole(req),
        inventoryKey,
        body,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update package.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':inventoryKey')
  async remove(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.packageService.deleteByInventoryKey(
        this.getCustodian(req),
        this.getRole(req),
        inventoryKey,
        body?.txHash,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to delete package.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

