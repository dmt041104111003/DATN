import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  productId: string;

  @IsString()
  docType: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  hash?: string;
}
