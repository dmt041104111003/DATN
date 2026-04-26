import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ContainerContractCreateDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  owners: string[];

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsObject()
  metadata: Record<string, string>;
}
