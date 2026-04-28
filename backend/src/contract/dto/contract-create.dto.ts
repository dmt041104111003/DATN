import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class ContractCreateDto {
  @IsArray()
  owners: string[];

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsObject()
  metadata: Record<string, string>;
}
