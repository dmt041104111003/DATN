import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CurrentUser } from '../auth/decorators';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.subscriptionService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.subscriptionService.findOne(id, user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.subscriptionService.remove(id, user.id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.subscriptionService.cancel(id, user.id);
  }
}
