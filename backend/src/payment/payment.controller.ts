import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.paymentService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.paymentService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.paymentService.remove(id, user.id);
  }
}
