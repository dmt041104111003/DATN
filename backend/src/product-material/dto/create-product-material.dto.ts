import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductMaterialDto {
  @IsString()
  productId: string;

  @IsString()
  materialId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;
}
