import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductContractService } from './product.contract.service';
import { ProductContractCreateDto } from './dto/product-contract-create.dto';
import { ProductContractSaveDto } from './dto/product-contract-save.dto';
import { ProductContractDeleteDto } from './dto/product-contract-delete.dto';

@Controller('products/contract')
@UseGuards(JwtAuthGuard)
export class ProductContractController {
  constructor(private readonly svc: ProductContractService) {}

  @Get('info')
  async info(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.svc.getInfo(owners);
  }

  @Post('create')
  async create(@Body() dto: ProductContractCreateDto) {
    return this.svc.createUnsignedCreateTx(dto);
  }

  @Post('save')
  async save(@Body() dto: ProductContractSaveDto) {
    return this.svc.createUnsignedSaveTx(dto);
  }

  @Post('delete')
  async delete(@Body() dto: ProductContractDeleteDto) {
    return this.svc.createUnsignedDeleteTx(dto);
  }
}

