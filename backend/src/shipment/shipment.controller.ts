import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShipmentService } from './shipment.service';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

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
    return this.shipmentService.list(this.getCustodian(req));
  }

  @Post('updater-locations')
  async updaterLocations(@Body() body: any) {
    return this.shipmentService.resolveUpdaterLocations(body?.addresses);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.shipmentService.create(this.getCustodian(req), body);
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to create shipment.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':shipmentInventoryKey/location')
  async updateLocation(
    @Req() req: any,
    @Param('shipmentInventoryKey') shipmentInventoryKey: string,
    @Body() body: any,
  ) {
    try {
      return await this.shipmentService.updateLocation(
        this.getCustodian(req),
        this.getRole(req),
        shipmentInventoryKey,
        body,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update shipment location.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':shipmentInventoryKey/status')
  async updateStatus(
    @Req() req: any,
    @Param('shipmentInventoryKey') shipmentInventoryKey: string,
    @Body() body: any,
  ) {
    try {
      return await this.shipmentService.updateStatus(
        this.getCustodian(req),
        this.getRole(req),
        shipmentInventoryKey,
        body,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to update shipment status.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':shipmentInventoryKey')
  async remove(
    @Req() req: any,
    @Param('shipmentInventoryKey') shipmentInventoryKey: string,
    @Body() body: any,
  ) {
    try {
      return await this.shipmentService.deleteByInventoryKey(
        this.getCustodian(req),
        this.getRole(req),
        shipmentInventoryKey,
        body?.txHash,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to delete shipment.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
