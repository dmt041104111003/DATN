import { Inject, Injectable } from "@nestjs/common";
import { CERTIFICATE_REPOSITORY, CertificateRepositoryPort } from "./domain/certificate.repository";
import { ListCertificatesUseCase } from "./application/use-cases/list-certificates.use-case";
import { GetCertificateByIdUseCase } from "./application/use-cases/get-certificate-by-id.use-case";
import { CreateCertificateUseCase } from "./application/use-cases/create-certificate.use-case";

@Injectable()
export class CertificateService {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort,
    private readonly listCertificatesUseCase: ListCertificatesUseCase,
    private readonly getCertificateByIdUseCase: GetCertificateByIdUseCase,
    private readonly createCertificateUseCase: CreateCertificateUseCase
  ) {}

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
    return this.listCertificatesUseCase.execute(issuerProfileId, options);
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
    return this.getCertificateByIdUseCase.execute(id, issuerProfileId);
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
    return this.createCertificateUseCase.execute(issuerProfileId, data);
  }
}
