export class CreateCertificateDto {
  title!: string;
  batchId!: string;
  imageUrl!: string;
  metadata?: Record<string, unknown>;
}
