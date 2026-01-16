import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateDocumentDto) {
    return this.prisma.document.create({ data: dto });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.findOne(id);
    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.document.delete({ where: { id } });
  }
}