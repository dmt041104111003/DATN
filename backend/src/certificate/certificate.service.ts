import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateRepositoryPort,
  CertificateDetail,
  CreateCertificateData,
} from "./domain/certificate.repository";
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
    options?: {
      search?: string;
      page?: number;
      pageSize?: number;
      attachedToBatchId?: string;
    }
  ): Promise<{
    total: number;
    items: {
      id: number;
      title: string;
      imageUrl: string | null;
      issuedAt: Date;
      number: string | null;
      authority: string | null;
      expiryDate: Date | null;
      documentType: string | null;
      standardReference: string | null;
      scope: string | null;
      documentUrl: string | null;
    }[];
  }> {
    return this.listCertificatesUseCase.execute(issuerProfileId, options);
  }

  async getById(id: number, issuerProfileId: number): Promise<CertificateDetail> {
    return this.getCertificateByIdUseCase.execute(id, issuerProfileId);
  }

  async create(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    return this.createCertificateUseCase.execute(issuerProfileId, data);
  }

  async setCertificatesForBatch(
    batchId: string,
    issuerProfileId: number,
    certificateIds: number[]
  ): Promise<void> {
    try {
      await this.repository.setCertificatesForBatch(
        batchId,
        issuerProfileId,
        certificateIds
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes("Batch not found")) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async getCertificateIdsByBatchId(
    batchId: string,
    issuerProfileId: number
  ): Promise<number[]> {
    return this.repository.getCertificateIdsByBatchId(batchId, issuerProfileId);
  }
}
