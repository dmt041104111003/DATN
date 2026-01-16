import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.document.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.document.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Document not found');
    return item;
  }

  private async findOneOwned(id: string, userId: string) {
    const item = await this.prisma.document.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!item) throw new NotFoundException('Document not found');
    if (item.product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return item;
  }
  async create(userId: string, dto: CreateDocumentDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Not your product');

    return this.prisma.document.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateDocumentDto) {
    await this.findOneOwned(id, userId);
    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.document.delete({ where: { id } });
  }
}
