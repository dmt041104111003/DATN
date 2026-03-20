import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  private getWalletAddress(req: any): string {
    const walletAddress =
      req.user?.walletAddress || req.user?.paymentAddress || req.user?.sub;
    if (!walletAddress) {
      throw new HttpException(
        'Unable to determine wallet address from token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return walletAddress;
  }

  @Get()
  async list(@Req() req: any) {
    return this.warehouseService.list(this.getWalletAddress(req));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      code: string;
      name: string;
      maxAssets?: number | null;
    },
  ) {
    return this.warehouseService.create(body, this.getWalletAddress(req));
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      isActive?: boolean;
      maxAssets?: number | null;
    },
  ) {
    return this.warehouseService.update(id, this.getWalletAddress(req), body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.warehouseService.remove(id, this.getWalletAddress(req));
  }

  @Get(':id/assets')
  async getAssets(@Req() req: any, @Param('id') id: string) {
    return this.warehouseService.getAssets(id, this.getWalletAddress(req));
  }

  @Post(':id/burn-token222')
  async burnToken222(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { unit?: string },
  ) {
    const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
    const unit = (body?.unit || '').trim();
    if (!unit) {
      throw new HttpException('unit is required', HttpStatus.BAD_REQUEST);
    }
    return this.warehouseService.buildBurnToken222InWarehouse({
      warehouseId: id,
      walletAddress: this.getWalletAddress(req),
      roleCode,
      unit,
    });
  }
}

