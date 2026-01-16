import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProductionProcessDto {
  @IsString()
  productId: string;

  @IsString()
  stepName: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
