import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  supplierId: string;

  @IsString()
  name: string;

  @IsDateString()
  @IsOptional()
  harvestDate?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
