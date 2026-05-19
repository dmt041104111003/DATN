import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractService } from './contract.service';
import { ContractCreateDto } from './dto/contract-create.dto';
import { ContractBatchCreateDto } from './dto/contract-batch-create.dto';
import { ContractSaveDto } from './dto/contract-save.dto';
import { ContractBurnDto } from './dto/contract-burn.dto';

@Controller('contract')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly svc: ContractService) {}

  private getSignerAddress(req: any): string {
    return String(req?.user?.paymentAddress || req?.user?.walletAddress || req?.user?.sub || '').trim();
  }

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Req() req: any, @Body() dto: ContractCreateDto) {
    return this.svc.createUnsignedCreateTx(dto, this.getSignerAddress(req));
  }

  @Post('create-batch')
  async createBatch(@Req() req: any, @Body() dto: ContractBatchCreateDto) {
    return this.svc.createUnsignedBatchCreateTx(dto, this.getSignerAddress(req));
  }

  @Post('save')
  async save(@Req() req: any, @Body() dto: ContractSaveDto) {
    return this.svc.createUnsignedSaveTx(dto, this.getSignerAddress(req));
  }

  @Post('burn')
  async burn(@Req() req: any, @Body() dto: ContractBurnDto) {
    return this.svc.createUnsignedBurnTx(dto, this.getSignerAddress(req));
  }
}
