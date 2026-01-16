import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private ipfs: IpfsService,
  ) {}

  async findAllByUser(userId: string) {
    const media = await this.prisma.media.findMany({ where: { userId } });
    return media.map((m) => ({
      ...m,
      gatewayUrl: this.ipfs.toGatewayUrl(m.url),
    }));
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Media not found');
    if (item.userId !== userId) throw new ForbiddenException('Not your media');
    return {
      ...item,
      gatewayUrl: this.ipfs.toGatewayUrl(item.url),
    };
  }

  async uploadToIpfs(userId: string, file: Express.Multer.File) {
    const { cid, url } = await this.ipfs.uploadFile(file, {
      name: file.originalname,
    });
    const type = this.getFileType(file.mimetype);
    const media = await this.prisma.media.create({
      data: {
        userId,
        name: file.originalname,
        type,
        url, // ipfs://CID
      },
    });

    return {
      ...media,
      cid,
      gatewayUrl: this.ipfs.toGatewayUrl(url),
    };
  }

  async uploadBatchToIpfs(userId: string, files: Express.Multer.File[]) {
    const results = await Promise.all(
      files.map((file) => this.uploadToIpfs(userId, file)),
    );
    return results;
  }

  async update(id: string, userId: string, dto: UpdateMediaDto) {
    await this.findOne(id, userId);
    return this.prisma.media.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const media = await this.findOne(id, userId);
    if (media.url.startsWith('ipfs://')) {
      const cid = media.url.replace('ipfs://', '');
      await this.ipfs.unpin(cid);
    }

    return this.prisma.media.delete({ where: { id } });
  }
  private getFileType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype === 'application/pdf') return 'pdf';
    return 'other';
  }
}
