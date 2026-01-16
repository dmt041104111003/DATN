import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductMaterialDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
