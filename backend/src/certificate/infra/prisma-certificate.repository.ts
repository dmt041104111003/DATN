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
      productBatches?: { some: { batchId: string } };
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        imageUrl?: { contains: string; mode: "insensitive" };
        number?: { contains: string; mode: "insensitive" };
        authority?: { contains: string; mode: "insensitive" };
      }>;
    } = { issuerProfileId };

    if (options?.attachedToBatchId?.trim()) {
      where.productBatches = {
        some: { batchId: options.attachedToBatchId.trim() },
      };
    }
    if (options?.search?.trim()) {
      const q = options.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { imageUrl: { contains: q, mode: "insensitive" } },
        { number: { contains: q, mode: "insensitive" } },
        { authority: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return {
      total,
      items: items.map(
        (c): CertificateListItem => ({
          id: c.id,
          title: c.title,
          imageUrl: c.imageUrl ?? null,
          issuedAt: c.issuedAt,
          number: c.number ?? null,
          authority: c.authority ?? null,
          expiryDate: c.expiryDate ?? null,
          documentType: c.documentType ?? null,
          standardReference: c.standardReference ?? null,
          scope: c.scope ?? null,
          documentUrl: c.documentUrl ?? null,
        })
      ),
    };
  }

  async getCertificateById(
    id: number,
    issuerProfileId: number
  ): Promise<CertificateDetail | null> {
    const cert = await this.prisma.certificate.findFirst({
      where: { id, issuerProfileId },
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
      documentType: cert.documentType ?? null,
      standardReference: cert.standardReference ?? null,
      scope: cert.scope ?? null,
      documentUrl: cert.documentUrl ?? null,
    };
  }

  async createCertificate(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    const cert = await this.prisma.certificate.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        issuerProfileId,
        subjectProfileId: issuerProfileId,
        number:
          data.number != null && typeof data.number === "string" && data.number.trim
            ? data.number.trim()
            : data.number ?? null,
        authority:
          data.authority != null &&
          typeof data.authority === "string" &&
          data.authority.trim
            ? data.authority.trim()
            : data.authority ?? null,
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate as string | Date)
          : null,
        documentType: data.documentType ?? undefined,
        standardReference: data.standardReference ?? undefined,
        scope: data.scope ?? undefined,
        documentUrl: data.documentUrl ?? undefined,
      },
    });

    return {
      id: cert.id,
      title: cert.title,
      imageUrl: cert.imageUrl ?? null,
    };
  }

  async setCertificatesForBatch(
    batchId: string,
    issuerProfileId: number,
    certificateIds: number[]
  ): Promise<void> {
    const batch = await this.prisma.productBatch.findFirst({
      where: { batchId, minterProfileId: issuerProfileId },
      select: { id: true },
    });
    if (!batch) {
      throw new Error("Batch not found or you are not the minter.");
    }
    const validIds = certificateIds.filter(Number.isFinite);
    const certs = await this.prisma.certificate.findMany({
      where: {
        id: { in: validIds },
        issuerProfileId,
      },
      select: { id: true },
    });
    const ids = certs.map((c) => c.id);
    await this.prisma.productBatch.update({
      where: { batchId },
      data: {
        certificates: {
          set: ids.map((id) => ({ id })),
        },
      },
    });
  }

  async getCertificateIdsByBatchId(
    batchId: string,
    issuerProfileId: number
  ): Promise<number[]> {
    const batch = await this.prisma.productBatch.findFirst({
      where: { batchId, minterProfileId: issuerProfileId },
      include: {
        certificates: { select: { id: true } },
      },
    });
    if (!batch) return [];
    return batch.certificates.map((c) => c.id);
  }
}
