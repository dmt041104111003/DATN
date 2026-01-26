import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { hashMaterial } from '../utils/hash.util';

@Injectable()
export class MaterialService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAllByUser(userId: string) {
    const cacheKey = `materials:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const materials = await this.prisma.material.findMany({
      where: {
        supplier: { userId },
      },
      include: { supplier: true },
    });
    await this.redis.set(cacheKey, materials, 300);
    return materials;
  }

  async findBySupplier(supplierId: string, userId: string) {
    const cacheKey = `materials:supplier:${supplierId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId)
      throw new ForbiddenException('Not your supplier');

    const materials = await this.prisma.material.findMany({
      where: { supplierId },
    });
    await this.redis.set(cacheKey, materials, 300);
    return materials;
  }

  async findOne(id: string, userId: string) {
    const cacheKey = `material:${id}`;
    const cached = await this.redis.get<{ id: string; userId: string; supplierId: string; name: string; harvestDate: Date | null; createdAt: Date; updatedAt: Date; supplier: { id: string; userId: string; name: string; location: string | null; gpsCoordinates: string | null; contactInfo: string | null; createdAt: Date; updatedAt: Date } }>(cacheKey);
    if (cached && typeof cached === 'object' && 'supplier' in cached) {
      if (cached.supplier.userId !== userId)
        throw new ForbiddenException('Access denied');
      return cached;
    }

    const item = await this.prisma.material.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!item) throw new NotFoundException('Material not found');
    if (item.supplier.userId !== userId)
      throw new ForbiddenException('Access denied');

    await this.redis.set(cacheKey, item, 300);
    return item;
  }

  async create(userId: string, dto: CreateMaterialDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (supplier.userId !== userId)
      throw new ForbiddenException('Not your supplier');

    const harvestDate = dto.harvestDate ? new Date(dto.harvestDate) : null;
    const materialHash = hashMaterial(dto.name, dto.supplierId, harvestDate);

    const material = await (this.prisma as any).material.create({
      data: {
        supplierId: dto.supplierId,
        name: dto.name,
        harvestDate,
        materialHash,
        userId,
      },
    });
    await this.redis.delMultiple([
      `materials:user:${userId}`,
      `materials:supplier:${dto.supplierId}`,
    ]);
    return material;
  }

  async update(id: string, userId: string, dto: UpdateMaterialDto) {
    const existing = await this.findOne(id, userId);
    const material = await this.prisma.material.findUnique({
      where: { id },
      select: { supplierId: true, name: true, harvestDate: true },
    });
    
    const name = dto.name || material?.name || '';
    const supplierId = material?.supplierId || '';
    const harvestDate = dto.harvestDate ? new Date(dto.harvestDate) : (material?.harvestDate || null);
    const materialHash = hashMaterial(name, supplierId, harvestDate);
    
    const updated = await (this.prisma as any).material.update({
      where: { id },
      data: {
        ...dto,
        materialHash,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
      },
    });
    if (material) {
      await this.redis.delMultiple([
        `material:${id}`,
        `materials:user:${userId}`,
        `materials:supplier:${material.supplierId}`,
      ]);
    }
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    const material = await this.prisma.material.findUnique({
      where: { id },
      select: { supplierId: true },
    });
    await this.prisma.material.delete({ where: { id } });
    if (material) {
      await this.redis.delMultiple([
        `material:${id}`,
        `materials:user:${userId}`,
        `materials:supplier:${material.supplierId}`,
      ]);
    }
  }
}
