import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  CERTIFICATE_REPOSITORY,
  CertificateRepositoryPort,
  CreateCertificateData,
} from "../../domain/certificate.repository";

@Injectable()
export class CreateCertificateUseCase {
  constructor(
    @Inject(CERTIFICATE_REPOSITORY)
    private readonly repository: CertificateRepositoryPort
  ) {}

  async execute(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }> {
    const title = (data.title || "").trim();
    const imageUrl = (data.imageUrl || "").trim();
    const number = (data.number || "").trim();
    const authority = (data.authority || "").trim();
    const expiryRaw = data.expiryDate;

    if (!title) {
      throw new BadRequestException("title is required.");
    }
    if (!imageUrl) {
      throw new BadRequestException(
        "imageUrl is required (upload image via POST /upload/image first).",
      );
    }

    if (!number) {
      throw new BadRequestException("Certificate number (No.) is required.");
    }
    if (!authority) {
      throw new BadRequestException("Certificate authority is required.");
    }
    let expiryDate: Date | undefined;
    if (expiryRaw != null) {
      const d =
        expiryRaw instanceof Date ? expiryRaw : new Date(String(expiryRaw));
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException("expiryDate is invalid.");
      }
      expiryDate = d;
    }

    return this.repository.createCertificate(issuerProfileId, {
      title,
      imageUrl,
      number,
      authority,
      expiryDate,
      documentType: data.documentType,
      standardReference: data.standardReference,
      scope: data.scope,
      documentUrl: data.documentUrl,
    });
  }
}

