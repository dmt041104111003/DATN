import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feedback.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.feedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Feedback not found');
    return item;
  }

  async create(dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({ data: dto });
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    await this.findOne(id);
    return this.prisma.feedback.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.feedback.delete({ where: { id } });
  }
}