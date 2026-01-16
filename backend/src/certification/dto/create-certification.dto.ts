import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  productId: string;

  @IsString()
  certName: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  certHash?: string;
}
