import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  harvestDate?: string;
}
