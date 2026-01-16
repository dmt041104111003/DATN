import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  private async findOneOwned(id: string, userId: string) {
    const item = await this.findOne(id);
    if (item.userId !== userId)
      throw new ForbiddenException('Not your feedback');
    return item;
  }

  async create(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateFeedbackDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.feedback.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.feedback.delete({ where: { id } });
  }
}
