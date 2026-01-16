import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProductionProcessDto {
  @IsString()
  @IsOptional()
  stepName?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
