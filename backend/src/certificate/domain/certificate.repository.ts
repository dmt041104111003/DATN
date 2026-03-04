export interface ListCertificatesOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  attachedToBatchId?: string;
}

export interface CertificateListItem {
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
}

export interface CertificateDetail {
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
}

export interface CreateCertificateData {
  title: string;
  imageUrl: string;
  number?: string;
  authority?: string;
  expiryDate?: Date | string;
  documentType?: string | null;
  standardReference?: string | null;
  scope?: string | null;
  documentUrl?: string | null;
}

export interface UpdateCertificateData {
  title?: string;
  imageUrl?: string;
  number?: string | null;
  authority?: string | null;
  expiryDate?: Date | string | null;
  documentType?: string | null;
  standardReference?: string | null;
  scope?: string | null;
  documentUrl?: string | null;
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

  createCertificate(
    issuerProfileId: number,
    data: CreateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }>;

  updateCertificate(
    id: number,
    issuerProfileId: number,
    data: UpdateCertificateData
  ): Promise<{ id: number; title: string; imageUrl: string | null }>;

  deleteCertificate(
    id: number,
    issuerProfileId: number
  ): Promise<void>;

  setCertificatesForBatch(
    batchId: string,
    issuerProfileId: number,
    certificateIds: number[]
  ): Promise<void>;

  getCertificateIdsByBatchId(
    batchId: string,
    issuerProfileId: number
  ): Promise<number[]>;
}

export const CERTIFICATE_REPOSITORY = "CERTIFICATE_REPOSITORY";

