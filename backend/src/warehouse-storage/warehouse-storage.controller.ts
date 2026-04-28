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
import { WarehouseStorageService } from './warehouse-storage.service';

@Controller('warehouse-storage')
@UseGuards(JwtAuthGuard)
export class WarehouseStorageController {
  constructor(private readonly warehouseStorageService: WarehouseStorageService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException('Unable to determine account identity from session.', HttpStatus.UNAUTHORIZED);
    }
    return custodian;
  }

  private getRole(req: any): string {
    return String(req?.user?.role || req?.user?.roleCode || '').trim();
  }

  @Get()
  async list(@Req() req: any) {
    return this.warehouseStorageService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.warehouseStorageService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to create warehouse storage.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.warehouseStorageService.update(this.getCustodian(req), id, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update warehouse storage.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.warehouseStorageService.remove(this.getCustodian(req), this.getRole(req), id, body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to delete warehouse storage.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

