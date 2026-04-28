import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductionService } from './production.service';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

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
    return this.productionService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.productionService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to register production.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':inventoryKey')
  async update(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.productionService.update(this.getCustodian(req), inventoryKey, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update production.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':inventoryKey')
  async remove(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.productionService.deleteByInventoryKey(
        this.getCustodian(req),
        this.getRole(req),
        inventoryKey,
        body?.txHash,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to delete production.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
