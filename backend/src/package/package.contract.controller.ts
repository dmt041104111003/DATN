import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PackageContractService } from './package.contract.service';

@Controller('packages/contract')
@UseGuards(JwtAuthGuard)
export class PackageContractController {
  constructor(private readonly svc: PackageContractService) {}

  @Post('create')
  async create(@Body() dto: any) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('burn')
  async burn(@Body() dto: any) {
    return this.svc.createUnsignedBurnTx(dto);
  }
}

