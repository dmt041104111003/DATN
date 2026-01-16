import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Public } from '../auth/public.decorator';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Public()
  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}