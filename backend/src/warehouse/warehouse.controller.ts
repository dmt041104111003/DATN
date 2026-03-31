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
        'Unable to determine account identity from session.',
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
      maxProducts?: number | null;
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
      maxProducts?: number | null;
    },
  ) {
    return this.warehouseService.update(id, this.getWalletAddress(req), body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.warehouseService.remove(id, this.getWalletAddress(req));
  }

  @Get(':id/products')
  async getProducts(@Req() req: any, @Param('id') id: string) {
    return this.warehouseService.getProducts(id, this.getWalletAddress(req));
  }

  @Post(':id/finalize-outbound-handoff')
  async finalizeOutboundHandoff(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { inventoryKey?: string },
  ) {
    const roleCode = (req.user?.role ?? req.user?.roleCode ?? '').toString();
    const inventoryKey = (body?.inventoryKey || '').trim();
    if (!inventoryKey) {
      throw new HttpException('inventoryKey is required', HttpStatus.BAD_REQUEST);
    }
    return this.warehouseService.finalizeOutboundHandoffInWarehouse({
      warehouseId: id,
      walletAddress: this.getWalletAddress(req),
      roleCode,
      unit: inventoryKey,
    });
  }
}
