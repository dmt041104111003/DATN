import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductionContractService } from './production.contract.service';

@Controller('productions/contract')
@UseGuards(JwtAuthGuard)
export class ProductionContractController {
  constructor(private readonly svc: ProductionContractService) {}

  private getSignerAddress(req: any): string {
    return String(req?.user?.paymentAddress || req?.user?.walletAddress || req?.user?.sub || '').trim();
  }

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Req() req: any, @Body() dto: any) {
    return this.svc.createUnsignedCreateTx(dto, this.getSignerAddress(req));
  }

  @Post('save')
  async save(@Req() req: any, @Body() dto: any) {
    return this.svc.createUnsignedSaveTx(dto, this.getSignerAddress(req));
  }

  @Post('burn')
  async burn(@Req() req: any, @Body() dto: any) {
    return this.svc.createUnsignedBurnTx(dto, this.getSignerAddress(req));
  }
}
