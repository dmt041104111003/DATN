import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateRepositoryPort,
  UpdateCertificateData,
} from "../../domain/certificate.repository";

@Injectable()
export class UpdateCertificateUseCase {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort
  ) {}

  async execute(
    id: number,
    issuerProfileId: number,
    data: UpdateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    if (!Number.isFinite(id)) {
      throw new BadRequestException("Invalid certificate id.");
    }

    const payload: UpdateCertificateData = {};

    if (data.title !== undefined) {
      const title = (data.title || "").trim();
      if (!title) {
        throw new BadRequestException("title cannot be empty.");
      }
      payload.title = title;
    }
    if (data.imageUrl !== undefined) {
      const v = (data.imageUrl || "").trim();
      payload.imageUrl = v || undefined;
    }
    if (data.number !== undefined) {
      payload.number = data.number != null ? String(data.number).trim() || null : null;
    }
    if (data.authority !== undefined) {
      payload.authority = data.authority != null ? String(data.authority).trim() || null : null;
    }
    if (data.expiryDate !== undefined) {
      if (data.expiryDate == null) {
        payload.expiryDate = null;
      } else {
        const d =
          data.expiryDate instanceof Date
            ? data.expiryDate
            : new Date(String(data.expiryDate));
        if (Number.isNaN(d.getTime())) {
          throw new BadRequestException("expiryDate is invalid.");
        }
        payload.expiryDate = d;
      }
    }
    if (data.documentType !== undefined) {
      payload.documentType = data.documentType != null ? String(data.documentType).trim() || null : null;
    }
    if (data.standardReference !== undefined) {
      payload.standardReference = data.standardReference != null ? String(data.standardReference).trim() || null : null;
    }
    if (data.scope !== undefined) {
      payload.scope = data.scope != null ? String(data.scope).trim() || null : null;
    }
    if (data.documentUrl !== undefined) {
      payload.documentUrl = data.documentUrl != null ? String(data.documentUrl).trim() || null : null;
    }

    return this.repository.updateCertificate(id, issuerProfileId, payload);
  }
}
