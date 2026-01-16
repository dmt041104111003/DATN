import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateCertificationDto {
  @IsString()
  @IsOptional()
  certName?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  certHash?: string;
}
