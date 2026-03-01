import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CertificateService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    issuerProfileId: number,
    options?: { batchId?: string; search?: string; page?: number; pageSize?: number }
  ): Promise<{
    total: number;
    items: {
      id: number;
      title: string;
      imageUrl: string | null;
      issuedAt: Date;
      batchId: string;
      batchName: string;
      productBatchCode: string;
      productBatchName: string | null;
      metadata: unknown;
    }[];
  }> {
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: { issuerProfileId: number; batchId?: string; OR?: Array<{ title?: { contains: string; mode: string }; imageUrl?: { contains: string; mode: string }; batchId?: { contains: string; mode: string } }> } = { issuerProfileId };
    if (options?.batchId?.trim()) {
      where.batchId = options.batchId.trim();
    } else if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { imageUrl: { contains: q, mode: "insensitive" } },
        { batchId: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      (this.prisma as any).certificate.findMany({
        where,
        include: {
          batch: { select: { code: true, name: true } },
        },
        orderBy: { issuedAt: "desc" },
        skip,
        take: pageSize,
      }),
      (this.prisma as any).certificate.count({ where }),
    ]);

    return {
      total,
      items: items.map((c: any) => ({
        id: c.id,
        title: c.title,
        imageUrl: c.imageUrl ?? null,
        issuedAt: c.issuedAt,
        batchId: c.batchId,
        batchName: c.batch?.name ?? c.batchId,
        productBatchCode: c.batchId,
        productBatchName: c.batch?.name ?? null,
        metadata: c.metadata ?? null,
      })),
    };
  }

  async getById(id: number, issuerProfileId: number): Promise<{
    id: number;
    title: string;
    imageUrl: string | null;
    issuedAt: Date;
    metadata: unknown;
    batchId: string;
    batchName: string;
    productBatchCode: string;
    productBatchName: string | null;
  }> {
    const cert = await (this.prisma as any).certificate.findFirst({
      where: { id, issuerProfileId },
      include: { batch: { select: { code: true, name: true } } },
    });
    if (!cert) {
      throw new NotFoundException("Certificate not found.");
    }
    return {
      id: cert.id,
      title: cert.title,
      imageUrl: cert.imageUrl ?? null,
      issuedAt: cert.issuedAt,
      metadata: cert.metadata ?? null,
      batchId: cert.batchId,
      batchName: cert.batch?.name ?? cert.batchId,
      productBatchCode: cert.batchId,
      productBatchName: cert.batch?.name ?? null,
    };
  }

  async create(
    issuerProfileId: number,
    data: {
      title: string;
      batchId: string;
      imageUrl: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    const title = (data.title || "").trim();
    const batchId = (data.batchId || "").trim();
    const imageUrl = (data.imageUrl || "").trim();

    if (!title || !batchId) {
      throw new BadRequestException("title and batchId are required.");
    }
    if (!imageUrl) {
      throw new BadRequestException("imageUrl is required (upload image via POST /upload/image first).");
    }

    const batch = await (this.prisma as any).productBatch.findFirst({
      where: { code: batchId, minterProfileId: issuerProfileId },
    });
    if (!batch) {
      throw new BadRequestException("Batch not found or you are not the minter.");
    }

    const cert = await (this.prisma as any).certificate.create({
      data: {
        title,
        imageUrl,
        batchId,
        issuerProfileId,
        metadata: data.metadata != null ? data.metadata : undefined,
      },
    });

    return {
      id: cert.id,
      title: cert.title,
      imageUrl: cert.imageUrl ?? null,
    };
  }
}
