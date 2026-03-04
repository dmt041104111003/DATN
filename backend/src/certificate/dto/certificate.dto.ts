export class CreateCertificateDto {
  title!: string;
  imageUrl!: string;
  number!: string;
  authority!: string;
  expiryDate?: string;
  documentType?: string;
  standardReference?: string;
  scope?: string;
  documentUrl?: string;
}

export class UpdateCertificateDto {
  title?: string;
  imageUrl?: string;
  number?: string;
  authority?: string;
  expiryDate?: string;
  documentType?: string;
  standardReference?: string;
  scope?: string;
  documentUrl?: string;
}
