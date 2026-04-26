import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductionContractService } from './production.contract.service';

@Controller('productions/contract')
@UseGuards(JwtAuthGuard)
export class ProductionContractController {
  constructor(private readonly svc: ProductionContractService) {}

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Body() dto: any) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('save')
  async save(@Body() dto: any) {
    return this.svc.createUnsignedSaveTx(dto);
  }

  @Post('burn')
  async burn(@Body() dto: any) {
    return this.svc.createUnsignedBurnTx(dto);
  }
}
