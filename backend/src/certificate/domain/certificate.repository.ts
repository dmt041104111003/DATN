export interface ListCertificatesOptions {
  batchId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CertificateListItem {
  id: number;
  title: string;
  imageUrl: string | null;
  issuedAt: Date;
  number: string | null;
  authority: string | null;
  expiryDate: Date | null;
  batchId: string;
  batchName: string;
  productBatchCode: string;
  productBatchName: string | null;
  metadata: unknown;
}

export interface CertificateDetail {
  id: number;
  title: string;
  imageUrl: string | null;
  issuedAt: Date;
  number: string | null;
  authority: string | null;
  expiryDate: Date | null;
  metadata: unknown;
  batchId: string;
  batchName: string;
  productBatchCode: string;
  productBatchName: string | null;
}

export interface CreateCertificateData {
  title: string;
  batchId: string;
  imageUrl: string;
  number?: string;
  authority?: string;
  expiryDate?: Date | string;
  metadata?: Record<string, unknown>;
}

export interface CertificateRepositoryPort {
  listCertificates(
    issuerProfileId: number,
    options?: ListCertificatesOptions
  ): Promise<{ total: number; items: CertificateListItem[] }>;

  getCertificateById(
    id: number,
    issuerProfileId: number
  ): Promise<CertificateDetail | null>;

  batchExistsForIssuer(
    batchCode: string,
    issuerProfileId: number
  ): Promise<boolean>;

  createCertificate(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }>;
}

export const CERTIFICATE_REPOSITORY = "CERTIFICATE_REPOSITORY";

