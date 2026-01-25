import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../auth/decorators';
import { PayDto } from './dto/pay.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.subscriptionService.findAllByUser(user.id);
  }

  @Post('pay')
  pay(@CurrentUser() user: { id: string }, @Body() dto: PayDto) {
    return this.subscriptionService.pay(user.id, dto);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.subscriptionService.cancel(id, user.id);
  }
}
