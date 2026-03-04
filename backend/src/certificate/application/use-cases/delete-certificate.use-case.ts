import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateRepositoryPort,
} from "../../domain/certificate.repository";

@Injectable()
export class DeleteCertificateUseCase {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort
  ) {}

  async execute(id: number, issuerProfileId: number): Promise<void> {
    if (!Number.isFinite(id)) {
      throw new BadRequestException("Invalid certificate id.");
    }
    await this.repository.deleteCertificate(id, issuerProfileId);
  }
}
