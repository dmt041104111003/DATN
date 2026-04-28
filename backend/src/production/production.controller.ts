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

  private fail(error: unknown, fallback: string): never {
    throw new HttpException(
      error instanceof Error ? error.message : fallback,
      HttpStatus.BAD_REQUEST,
    );
  }

  @Get()
  async list() {
    return this.productionService.list();
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
      return await this.productionService.create(custodian, body);
    } catch (e) {
      this.fail(e, 'Failed to register production.');
    }
  }

  @Patch(':inventoryKey')
  async update(@Req() req: any, @Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
      return await this.productionService.update(custodian, inventoryKey, body);
    } catch (e) {
      this.fail(e, 'Failed to update production.');
    }
  }

  @Delete(':inventoryKey')
  async remove(@Param('inventoryKey') inventoryKey: string, @Body() body: any) {
    try {
      return await this.productionService.deleteByInventoryKey(inventoryKey, body?.txHash);
    } catch (e) {
      this.fail(e, 'Failed to delete production.');
    }
  }
}
