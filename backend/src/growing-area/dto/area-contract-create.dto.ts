import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AreaContractCreateDto {
  @IsString()
  @IsNotEmpty()
  custodianAddress: string;

  @IsArray()
  @IsString({ each: true })
  owners: string[];

  @IsString()
  @IsOptional()
  assetName?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  nftImageIpfs?: string;

  @IsString()
  @IsOptional()
  areaSize?: string;

  @IsString()
  @IsOptional()
  soilType?: string;
}

