import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanContractService } from './plan.contract.service';
import { PlanContractCreateDto } from './dto/plan-contract-create.dto';
import { PlanContractDeleteDto } from './dto/plan-contract-delete.dto';
import { PlanContractSaveDto } from './dto/plan-contract-save.dto';

@Controller('plans/contract')
@UseGuards(JwtAuthGuard)
export class PlanContractController {
  constructor(private readonly svc: PlanContractService) {}

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Body() dto: PlanContractCreateDto) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('delete')
  async delete(@Body() dto: PlanContractDeleteDto) {
    return this.svc.createUnsignedDeleteTx(dto);
  }

  @Post('save')
  async save(@Body() dto: PlanContractSaveDto) {
    return this.svc.createUnsignedSaveTx(dto);
  }
}

