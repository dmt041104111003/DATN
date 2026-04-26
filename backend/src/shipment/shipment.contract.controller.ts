import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShipmentContractService } from './shipment.contract.service';

@Controller('shipments/contract')
@UseGuards(JwtAuthGuard)
export class ShipmentContractController {
  constructor(private readonly svc: ShipmentContractService) {}

  @Post('create')
  async create(@Body() dto: any) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('burn')
  async burn(@Body() dto: any) {
    return this.svc.createUnsignedBurnTx(dto);
  }

  @Post('save')
  async save(@Body() dto: any) {
    return this.svc.createUnsignedSaveTx(dto);
  }
}
