import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateDetail,
  CertificateRepositoryPort,
} from "../../domain/certificate.repository";

@Injectable()
export class GetCertificateByIdUseCase {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort
  ) {}

  async execute(
    id: number,
    issuerProfileId: number
  ): Promise<CertificateDetail> {
    const cert = await this.repository.getCertificateById(id, issuerProfileId);
    if (!cert) {
      throw new NotFoundException("Certificate not found.");
    }
    return cert;
  }
}

