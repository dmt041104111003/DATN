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
import { WarehouseService } from './warehouse.service';

@Controller('warehouse')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  private getCustodian(req: any): string {
    const custodian = req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!custodian) {
      throw new HttpException('Unable to determine account identity from session.', HttpStatus.UNAUTHORIZED);
    }
    return custodian;
  }

  @Get()
  async list(@Req() req: any) {
    return this.warehouseService.list(this.getCustodian(req));
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.warehouseService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to create warehouse.', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.warehouseService.update(this.getCustodian(req), id, body);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to update warehouse.', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.warehouseService.remove(this.getCustodian(req), id);
    } catch (e) {
      throw new HttpException(e instanceof Error ? e.message : 'Failed to delete warehouse.', HttpStatus.BAD_REQUEST);
    }
  }
}

