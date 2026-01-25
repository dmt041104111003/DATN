import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CurrentUser } from '../auth/decorators';

@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.supplierService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.supplierService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateSupplierDto) {
    return this.supplierService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.supplierService.remove(id, user.id);
  }
}
