import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cacheKey = 'feedbacks:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const feedbacks = await this.prisma.feedback.findMany();
    await this.redis.set(cacheKey, feedbacks, 300);
    return feedbacks;
  }

  async findOne(id: string) {
    const cacheKey = `feedback:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const item = await this.prisma.feedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Feedback not found');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.findOne(id);
    if (!item || typeof item === 'string' || item.userId !== userId)
      throw new ForbiddenException('Not your feedback');
    return item;
  }

  async create(userId: string, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.create({
      data: { ...dto, userId },
    });
    await this.redis.delMultiple([
      'feedbacks:all',
      `feedbacks:product:${dto.productId}`,
    ]);
    return feedback;
  }

  async update(id: string, userId: string, dto: UpdateFeedbackDto) {
    const feedback = await this.findOneOwned(id, userId);
    const updated = await this.prisma.feedback.update({
      where: { id },
      data: dto,
    });
    if (feedback && typeof feedback === 'object' && 'productId' in feedback) {
      await this.redis.delMultiple([
        `feedback:${id}`,
        'feedbacks:all',
        `feedbacks:product:${feedback.productId}`,
      ]);
    }
    return updated;
  }

  async remove(id: string, userId: string) {
    const feedback = await this.findOneOwned(id, userId);
    await this.prisma.feedback.delete({ where: { id } });
    if (feedback && typeof feedback === 'object' && 'productId' in feedback) {
      await this.redis.delMultiple([
        `feedback:${id}`,
        'feedbacks:all',
        `feedbacks:product:${feedback.productId}`,
      ]);
    }
  }
}
