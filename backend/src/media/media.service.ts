import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { hashMedia } from '../utils/hash.util';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private ipfs: IpfsService,
    private subscriptionService: SubscriptionService,
  ) {}

  private async checkSubscriptionActive(userId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(userId);
    if (!subscription) {
      throw new BadRequestException(
        'Subscription has expired. Please renew to continue using this feature.',
      );
    }
    return subscription;
  }

  async findAllByUser(userId: string) {
    const cacheKey = `media:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const media = await this.prisma.media.findMany({ where: { userId } });
    const result = media.map((m) => ({
      ...m,
      gatewayUrl: this.ipfs.toGatewayUrl(m.url),
    }));
    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `media:${id}`;
    const cached = await this.redis.get<{ id: string; userId: string; name: string; type: string; url: string; gatewayUrl: string; createdAt: Date; updatedAt: Date }>(cacheKey);
    if (cached && typeof cached === 'object') {
      if (cached.userId !== userId)
        throw new ForbiddenException('Not your media');
      return cached;
    }

    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Media not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your media');

    const result = {
      ...item,
      gatewayUrl: this.ipfs.toGatewayUrl(item.url),
    };
    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async uploadToIpfs(userId: string, file: Express.Multer.File) {
    await this.checkSubscriptionActive(userId);
    
    try {
      const { cid, url } = await this.ipfs.uploadFile(file, {
        name: file.originalname,
      });
      const type = this.getFileType(file.mimetype);
      const mediaHash = hashMedia(url, type);
      const media = await (this.prisma as any).media.create({
        data: {
          userId,
          name: file.originalname,
          type,
          url,
          mediaHash,
        },
      });

      await this.redis.del(`media:user:${userId}`);

      return {
        ...media,
        cid,
        gatewayUrl: this.ipfs.toGatewayUrl(url),
      };
    } catch (error) {
      if (error instanceof BadRequestException && error.message.includes('IPFS')) {
        throw new BadRequestException(
          'IPFS connection error. Please try again later or contact technical support.',
        );
      }
      throw error;
    }
  }

  async uploadBatchToIpfs(userId: string, files: Express.Multer.File[]) {
    await this.checkSubscriptionActive(userId);
    
    const results = await Promise.allSettled(
      files.map((file) => this.uploadToIpfs(userId, file)),
    );
    
    const successful = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);
    
    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason);

    if (failed.length > 0 && successful.length === 0) {
      throw new BadRequestException(
        `Upload failed: ${failed[0]?.message || 'Unable to upload file'}. Please try again.`,
      );
    }

    return {
      successful,
      failed: failed.length,
      total: files.length,
    };
  }

  async update(id: string, userId: string, dto: UpdateMediaDto) {
    await this.findOne(id, userId);
    const updated = await this.prisma.media.update({
      where: { id },
      data: dto,
    });
    await this.redis.delMultiple([`media:${id}`, `media:user:${userId}`]);
    return updated;
  }

  async remove(id: string, userId: string) {
    const media = await this.findOne(id, userId);
    if (media && typeof media === 'object' && 'url' in media && media.url.startsWith('ipfs://')) {
      const cid = media.url.replace('ipfs://', '');
      await this.ipfs.unpin(cid);
    }

    await this.prisma.media.delete({ where: { id } });
    const mediaUserId = media && typeof media === 'object' && 'userId' in media ? media.userId : userId;
    await this.redis.delMultiple([`media:${id}`, `media:user:${mediaUserId}`]);
  }
  private getFileType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype === 'application/pdf') return 'pdf';
    return 'other';
  }
}
