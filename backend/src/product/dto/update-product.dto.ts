import { IsString, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  assetName?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
