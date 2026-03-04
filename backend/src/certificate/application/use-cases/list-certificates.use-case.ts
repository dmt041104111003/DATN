import { Inject, Injectable } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateRepositoryPort,
  ListCertificatesOptions,
} from "../../domain/certificate.repository";

@Injectable()
export class ListCertificatesUseCase {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort
  ) {}

  execute(
    issuerProfileId: number,
    options?: ListCertificatesOptions
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
    return this.repository.listCertificates(issuerProfileId, options);
  }
}

