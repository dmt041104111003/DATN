import { Body, Controller, HttpException, HttpStatus, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShipmentScanService } from './shipment-scan.service';

@Controller('shipment-scan')
@UseGuards(JwtAuthGuard)
export class ShipmentScanController {
  constructor(private readonly shipmentScanService: ShipmentScanService) {}

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

  @Patch(':shipmentInventoryKey')
  async scanUpdate(
    @Req() req: any,
    @Param('shipmentInventoryKey') shipmentInventoryKey: string,
    @Body() body: any,
  ) {
    try {
      return await this.shipmentScanService.scanUpdate(
        this.getCustodian(req),
        shipmentInventoryKey,
        body,
      );
    } catch (e) {
      throw new HttpException(
        e instanceof Error ? e.message : 'Failed to scan-update shipment.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

