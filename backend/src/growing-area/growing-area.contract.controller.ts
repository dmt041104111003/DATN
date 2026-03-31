import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GrowingAreaContractService } from './growing-area.contract.service';
import { AreaContractCreateDto } from './dto/area-contract-create.dto';
import { AreaContractDeleteDto } from './dto/area-contract-delete.dto';

@Controller('growing-areas/contract')
@UseGuards(JwtAuthGuard)
export class GrowingAreaContractController {
  constructor(private readonly svc: GrowingAreaContractService) {}

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Body() dto: AreaContractCreateDto) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('delete')
  async delete(@Body() dto: AreaContractDeleteDto) {
    return this.svc.createUnsignedDeleteTx(dto);
  }
}

