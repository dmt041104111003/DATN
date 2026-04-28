import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class ProductionContractCreateDto {
  @IsArray()
  owners: string[];

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsObject()
  metadata: Record<string, string>;
}
