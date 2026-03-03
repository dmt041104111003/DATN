import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CertificateDetail,
  CertificateListItem,
  CertificateRepositoryPort,
  CreateCertificateData,
  ListCertificatesOptions,
} from "../domain/certificate.repository";

@Injectable()
export class PrismaCertificateRepository implements CertificateRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listCertificates(
    issuerProfileId: number,
    options?: ListCertificatesOptions
  ): Promise<{ total: number; items: CertificateListItem[] }> {
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: {
      issuerProfileId: number;
      batchId?: string;
      OR?: Array<{
        title?: { contains: string; mode: string };
        imageUrl?: { contains: string; mode: string };
        batchId?: { contains: string; mode: string };
      }>;
    } = { issuerProfileId };

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
      items: items.map(
        (c: any): CertificateListItem => ({
          id: c.id,
          title: c.title,
          imageUrl: c.imageUrl ?? null,
          issuedAt: c.issuedAt,
          number: c.number ?? null,
          authority: c.authority ?? null,
          expiryDate: c.expiryDate ?? null,
          batchId: c.batchId,
          batchName: c.batch?.name ?? c.batchId,
          productBatchCode: c.batchId,
          productBatchName: c.batch?.name ?? null,
          metadata: c.metadata ?? null,
        })
      ),
    };
  }

  async getCertificateById(
    id: number,
    issuerProfileId: number
  ): Promise<CertificateDetail | null> {
    const cert = await (this.prisma as any).certificate.findFirst({
      where: { id, issuerProfileId },
      include: { batch: { select: { code: true, name: true } } },
    });
    if (!cert) return null;

    return {
      id: cert.id,
      title: cert.title,
      imageUrl: cert.imageUrl ?? null,
      issuedAt: cert.issuedAt,
      number: cert.number ?? null,
      authority: cert.authority ?? null,
      expiryDate: cert.expiryDate ?? null,
      metadata: cert.metadata ?? null,
      batchId: cert.batchId,
      batchName: cert.batch?.name ?? cert.batchId,
      productBatchCode: cert.batchId,
      productBatchName: cert.batch?.name ?? null,
    };
  }

  async batchExistsForIssuer(
    batchCode: string,
    issuerProfileId: number
  ): Promise<boolean> {
    const batch = await (this.prisma as any).productBatch.findFirst({
      where: { code: batchCode, minterProfileId: issuerProfileId },
    });
    return !!batch;
  }

  async createCertificate(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    const cert = await (this.prisma as any).certificate.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        batchId: data.batchId,
        issuerProfileId,
        number: data.number != null && data.number.trim ? data.number.trim() : data.number,
        authority:
          data.authority != null && data.authority.trim
            ? data.authority.trim()
            : data.authority,
        expiryDate: data.expiryDate ?? null,
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

