import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContainerContractService } from './container.contract.service';

@Controller('containers/contract')
@UseGuards(JwtAuthGuard)
export class ContainerContractController {
  constructor(private readonly svc: ContainerContractService) {}

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
